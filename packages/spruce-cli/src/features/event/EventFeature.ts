import { Schema } from '@sprucelabs/schema'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import syncEventActionSchema from '#spruce/schemas/spruceCli/v2020_07_22/syncEventAction.schema'
import { FileDescription } from '../../types/cli.types'
import AbstractFeature, {
	FeatureDependency,
	FeatureOptions,
} from '../AbstractFeature'
import { FeatureCode } from '../features.types'
import EventContractController from './EventContractUtil'

export default class EventFeature extends AbstractFeature {
	public code: FeatureCode = 'event'
	public nameReadable = 'Event'
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
	]

	protected actionsDir = diskUtil.resolvePath(__dirname, 'actions')

	public readonly fileDescriptions: FileDescription[] = []

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
			const generator = this.EventContractUtil()

			const uniqueSchemas = await generator.getUniqueSchemasFromContracts(
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

	public EventContractUtil() {
		return new EventContractController({
			cwd: this.cwd,
			optionsSchema: syncEventActionSchema,
			ui: this.ui,
			eventGenerator: this.Writer('event'),
			eventStore: this.Store('event'),
			skillStore: this.Store('skill'),
		})
	}
}
