import { Schema } from '@sprucelabs/schema'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import syncEventActionSchema from '#spruce/schemas/spruceCli/v2020_07_22/syncEventOptions.schema'
import TerminalInterface from '../../interfaces/TerminalInterface'
import { FileDescription } from '../../types/cli.types'
import actionUtil from '../../utilities/action.utility'
import AbstractFeature, {
	FeatureDependency,
	FeatureOptions,
} from '../AbstractFeature'
import { FeatureActionResponse, FeatureCode } from '../features.types'
import EventContractBuilder from './builders/EventContractBuilder'
import EventStore from './stores/EventStore'

export default class EventFeature extends AbstractFeature {
	public code: FeatureCode = 'event'
	public nameReadable = 'Events'
	public description = 'Connect to the Mercury Event Engine.'
	public dependencies: FeatureDependency[] = [
		{ code: 'schema', isRequired: true },
		{ code: 'permission', isRequired: true },
	]
	public packageDependencies = [
		{
			name: '@sprucelabs/mercury-client',
		},
		{
			name: '@sprucelabs/mercury-types',
		},
		{
			name: '@sprucelabs/spruce-event-utils',
		},
		{
			name: '@sprucelabs/spruce-event-plugin',
		},
		{
			name: '@sprucelabs/mercury-core-events',
		},
	]

	public actionsDir = diskUtil.resolvePath(__dirname, 'actions')

	public readonly fileDescriptions: FileDescription[] = []
	private contractBuilder?: EventContractBuilder
	private initiatingAction?: string

	public constructor(options: FeatureOptions) {
		super(options)

		void this.emitter.on(
			'schema.did-fetch-schemas',
			this.handleDidFetchSchemas.bind(this)
		)

		void this.emitter.on(
			'feature.will-execute',
			this.handleWillExecute.bind(this)
		)

		void this.emitter.on(
			'feature.did-execute',
			this.handleDidExecute.bind(this)
		)
	}

	public async afterPackageInstall() {
		diskUtil.createDir(diskUtil.resolvePath(this.cwd, 'src', 'events'))
		return this.optionallySyncListeners()
	}

	private async optionallySyncListeners() {
		let results: FeatureActionResponse = {}

		const isSkillInstalled = await this.features.isInstalled('skill')

		if (isSkillInstalled) {
			results = await this.Action('event', 'sync.listeners').execute({})
		}
		return results
	}

	private async handleWillExecute(payload: {
		featureCode: string
		actionCode: string
	}): Promise<FeatureActionResponse> {
		const { featureCode, actionCode } = payload

		let results: FeatureActionResponse = {}

		if (!this.initiatingAction) {
			EventStore.clearCache()
			const combined = this.combineCodes(featureCode, actionCode)
			this.initiatingAction = combined
		}

		if (featureCode === 'node' || featureCode === 'upgrade') {
			const settings = this.Service('eventCache')
			settings.clearListenerCache()
		}

		const isInstalled = await this.features.isInstalled('event')
		const isRemoteRelevant =
			isInstalled &&
			(featureCode === 'event' ||
				featureCode === 'eventContract' ||
				actionCode === 'login') &&
			actionCode !== 'setRemote'

		if (isRemoteRelevant) {
			const remoteResults = await this.appendRemoteToResultsOrPrompt()
			results = actionUtil.mergeActionResults(results, remoteResults)
		}

		return results
	}

	private async syncListenersAndMixinResults(results: FeatureActionResponse) {
		const syncResults = await this.optionallySyncListeners()
		results = actionUtil.mergeActionResults(results, syncResults)
		return results
	}

	private async handleDidExecute(payload: {
		featureCode: string
		actionCode: string
	}) {
		const { featureCode, actionCode } = payload
		const isInstalled = await this.features.isInstalled('event')

		let results = {}

		const isUpgrade =
			isInstalled && featureCode === 'node' && actionCode === 'upgrade'

		if (isUpgrade) {
			results = await this.Action('event', 'sync').execute({})
			results = await this.syncListenersAndMixinResults(results)
		}

		if (this.initiatingAction === this.combineCodes(featureCode, actionCode)) {
			EventStore.clearCache()
		}

		return results
	}

	private combineCodes(featureCode: string, actionCode: string) {
		return `${featureCode}.${actionCode}`
	}

	private async appendRemoteToResultsOrPrompt(): Promise<FeatureActionResponse> {
		const remote = this.Service('remote')
		const r = remote.getRemote()

		if (!r) {
			if (!TerminalInterface.doesSupportColor()) {
				throw new Error(
					`Dang! I couldn't find env.HOST. Once that is set, lets try again!`
				)
			}

			this.ui.stopLoading()
			this.ui.renderLine(
				`Uh oh! It looks like you haven't configured your remote! We gotta do that.`
			)

			const results = await this.Action('event', 'setRemote').execute({})

			return results
		} else {
			return {
				summaryLines: [`Remote: ${r}`, `Host: ${remote.getHost()}`],
			}
		}
	}

	private async handleDidFetchSchemas(payload: { schemas?: Schema[] | null }) {
		const isInstalled = await this.features.isInstalled(this.code)

		const lastSync = this.Service('eventCache').getLastSyncOptions()

		if (lastSync && isInstalled) {
			const writer = this.getEventContractBuilder()

			const uniqueSchemas = await writer.fetchContractsAndGenerateUniqueSchemas(
				payload.schemas ?? [],
				lastSync.shouldSyncOnlyCoreEvents
			)

			return {
				schemas: uniqueSchemas.schemas ?? [],
			}
		}

		return {
			schemas: [],
		}
	}

	public getEventContractBuilder() {
		if (!this.contractBuilder) {
			this.contractBuilder = new EventContractBuilder({
				cwd: this.cwd,
				optionsSchema: syncEventActionSchema,
				ui: this.ui,
				eventGenerator: this.Writer('event'),
				eventStore: this.Store('event'),
				skillStore: this.Store('skill'),
				dependencyService: this.Service('dependency'),
			})
		}

		return this.contractBuilder
	}

	public hasBeenSynced() {
		if (diskUtil.doesHashSprucePathExist(this.cwd)) {
			const writer = this.Writer('event')
			return writer.hasCombinedContractBeenWritten(this.cwd)
		}

		return false
	}
}

declare module '../../features/features.types' {
	interface FeatureMap {
		event: EventFeature
	}

	interface FeatureOptionsMap {
		event: undefined
	}
}
