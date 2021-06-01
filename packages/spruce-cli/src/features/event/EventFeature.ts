import { Schema } from '@sprucelabs/schema'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import syncEventActionSchema from '#spruce/schemas/spruceCli/v2020_07_22/syncEventOptions.schema'
import TerminalInterface from '../../interfaces/TerminalInterface'
import { FileDescription } from '../../types/cli.types'
import AbstractFeature, {
	FeatureDependency,
	FeatureOptions,
} from '../AbstractFeature'
import { FeatureActionResponse, FeatureCode } from '../features.types'
import EventContractBuilder from './builders/EventContractBuilder'

declare module '../../features/features.types' {
	interface FeatureMap {
		event: EventFeature
	}

	interface FeatureOptionsMap {
		event: undefined
	}
}

export default class EventFeature extends AbstractFeature {
	public code: FeatureCode = 'event'
	public nameReadable = 'Events'
	public description = 'Connect to the Mercury Event Engine.'
	public dependencies: FeatureDependency[] = [
		{ code: 'schema', isRequired: true },
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
	]

	public actionsDir = diskUtil.resolvePath(__dirname, 'actions')

	public readonly fileDescriptions: FileDescription[] = []
	private contractBuilder?: EventContractBuilder

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
	}

	public async afterPackageInstall() {
		diskUtil.createDir(diskUtil.resolvePath(this.cwd, 'src', 'events'))
		return {}
	}

	private async handleWillExecute(payload: {
		featureCode: string
		actionCode: string
	}): Promise<FeatureActionResponse> {
		const { featureCode, actionCode } = payload

		if (featureCode === 'event' && actionCode !== 'setRemote') {
			const remote = this.Service('remote')
			const r = remote.getRemote()

			if (!r) {
				if (!TerminalInterface.doesSupportColor()) {
					throw new Error(
						`Dang! I couldn't find env.HOST. Once that is set, lets try again!`
					)
				}

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

		return {}
	}

	private async handleDidFetchSchemas(payload: { schemas?: Schema[] | null }) {
		const isInstalled = await this.featureInstaller.isInstalled(this.code)

		const lastSync = this.Service('eventSettings').getLastSyncOptions()

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
			})
		}

		// this.contractBuilder.clearCache()

		return this.contractBuilder
	}
}
