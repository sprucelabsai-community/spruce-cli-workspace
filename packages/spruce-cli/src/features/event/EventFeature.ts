import { Schema } from '@sprucelabs/schema'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import syncEventActionSchema from '#spruce/schemas/spruceCli/v2020_07_22/syncEventOptions.schema'
import { FileDescription } from '../../types/cli.types'
import AbstractFeature, {
	FeatureDependency,
	FeatureOptions,
} from '../AbstractFeature'
import { FeatureCode } from '../features.types'
import EventContractWriter from './writers/EventContractWriter'

export default class EventFeature extends AbstractFeature {
	public code: FeatureCode = 'event'
	public nameReadable = 'Mercury  support'
	public description =
		'Plug into the Mercury XP and start creating experiences!'
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

	protected actionsDir = diskUtil.resolvePath(__dirname, 'actions')

	public readonly fileDescriptions: FileDescription[] = []
	private contractWriter?: EventContractWriter

	public constructor(options: FeatureOptions) {
		super(options)

		void this.emitter.on(
			'schema.did-fetch-schemas',
			this.handleDidFetchSchemas.bind(this)
		)
	}

	public async afterPackageInstall() {
		diskUtil.createDir(diskUtil.resolvePath(this.cwd, 'src', 'events'))
		return {}
	}

	private async handleDidFetchSchemas(payload: { schemas?: Schema[] | null }) {
		const isInstalled = await this.featureInstaller.isInstalled(this.code)

		if (isInstalled) {
			const writer = this.EventContractWriter()

			const uniqueSchemas = await writer.fetchContractsAndGenerateUniqueSchemas(
				payload.schemas ?? []
			)

			return {
				schemas: uniqueSchemas.schemas ?? [],
			}
		}

		return {
			schemas: [],
		}
	}

	public EventContractWriter() {
		if (!this.contractWriter) {
			this.contractWriter = new EventContractWriter({
				cwd: this.cwd,
				optionsSchema: syncEventActionSchema,
				ui: this.ui,
				eventGenerator: this.Writer('event'),
				eventStore: this.Store('event'),
				skillStore: this.Store('skill'),
			})
		}

		return this.contractWriter
	}
}
