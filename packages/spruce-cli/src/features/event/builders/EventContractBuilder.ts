import globby from '@sprucelabs/globby'
import { SpruceSchemas } from '@sprucelabs/mercury-types'
import {
	normalizeSchemaToIdWithVersion,
	Schema,
	SchemaTemplateItem,
} from '@sprucelabs/schema'
import { diskUtil, namesUtil } from '@sprucelabs/spruce-skill-utils'
import { isEqual } from 'lodash'
import DependencyService from '../../../services/DependencyService'
import EventTemplateItemBuilder from '../../../templateItemBuilders/EventTemplateItemBuilder'
import { GraphicsInterface } from '../../../types/cli.types'
import { FeatureActionResponse } from '../../features.types'
import SkillStore from '../../skill/stores/SkillStore'
import validateAndNormalizer from '../../validateAndNormalize.utility'
import EventStore from '../stores/EventStore'
import EventWriter from '../writers/EventWriter'

type OptionsSchema = SpruceSchemas.SpruceCli.v2020_07_22.SyncEventOptionsSchema
type Options = SpruceSchemas.SpruceCli.v2020_07_22.SyncEventOptions

export default class EventContractBuilder {
	private optionsSchema: OptionsSchema
	private ui: GraphicsInterface
	private eventWriter: EventWriter
	private cwd: string
	private eventStore: EventStore
	private skillStore: SkillStore
	private dependencyService: DependencyService

	public constructor(options: {
		optionsSchema: OptionsSchema
		ui: GraphicsInterface
		eventGenerator: EventWriter
		cwd: string
		eventStore: EventStore
		skillStore: SkillStore
		dependencyService: DependencyService
	}) {
		this.optionsSchema = options.optionsSchema
		this.ui = options.ui
		this.eventWriter = options.eventGenerator
		this.cwd = options.cwd
		this.eventStore = options.eventStore
		this.skillStore = options.skillStore
		this.dependencyService = options.dependencyService
	}

	public async fetchAndWriteContracts(
		options: Options
	): Promise<FeatureActionResponse> {
		const normalizedOptions = validateAndNormalizer.validateAndNormalize(
			this.optionsSchema,
			options
		)

		const { contractDestinationDir } = normalizedOptions

		const resolvedDestination = diskUtil.resolvePath(
			this.cwd,
			contractDestinationDir
		)

		const { errors, schemaTemplateItems, eventContractTemplateItems } =
			await this.fetchAndBuildTemplateItems({
				shouldSyncOnlyCoreEvents: options.shouldSyncOnlyCoreEvents ?? false,
				eventBuilderFile: normalizedOptions.eventBuilderFile,
			})

		if (errors && errors?.length > 0) {
			return {
				errors,
			}
		}

		this.ui.startLoading('Generating contracts...')

		const files = await this.eventWriter.writeContracts(resolvedDestination, {
			...normalizedOptions,
			eventContractTemplateItems,
			schemaTemplateItems,
			shouldImportCoreEvents: !options.shouldSyncOnlyCoreEvents,
		})

		await this.deleteOrphanedEventContracts(
			resolvedDestination,
			files.map((a) => a.path)
		)

		return {
			files,
		}
	}

	private async deleteOrphanedEventContracts(
		lookupDir: string,
		existingContracts: string[]
	) {
		const matches = await globby(lookupDir + '/**/*.contract.ts')
		const diff = matches.filter((m) => !existingContracts.includes(m))

		diff.forEach((f) => diskUtil.deleteFile(f))

		diskUtil.deleteEmptyDirs(lookupDir)
	}

	public async fetchContractsAndGenerateUniqueSchemas(
		existingSchemas: Schema[],
		shouldSyncOnlyCoreEvents: boolean
	): Promise<FeatureActionResponse & { schemas?: Schema[] }> {
		const { errors, schemaTemplateItems } =
			await this.fetchAndBuildTemplateItems({ shouldSyncOnlyCoreEvents })

		if (errors && errors?.length > 0) {
			return {
				errors,
			}
		}

		const filteredSchemas = this.filterSchemasBasedOnCallbackPayload(
			existingSchemas,
			schemaTemplateItems
		)

		return {
			schemas: filteredSchemas,
		}
	}

	private filterSchemasBasedOnCallbackPayload(
		existingSchemas: Schema[],
		schemaTemplateItems: SchemaTemplateItem[]
	) {
		const schemas = schemaTemplateItems.map((i) => i.schema)
		const filteredSchemas = schemas.filter((schema) => {
			const idWithVersion = normalizeSchemaToIdWithVersion(schema)
			return !existingSchemas.find((s) =>
				isEqual(normalizeSchemaToIdWithVersion(s), idWithVersion)
			)
		})

		return filteredSchemas
	}

	private async fetchAndBuildTemplateItems(options: {
		shouldSyncOnlyCoreEvents?: boolean
		eventBuilderFile?: string
	}) {
		const { shouldSyncOnlyCoreEvents, eventBuilderFile } = options

		this.ui.startLoading('Loading skill details...')

		let namespace: string | undefined =
			await this.skillStore.loadCurrentSkillsNamespace()

		this.ui.startLoading('Fetching event contracts...')

		const namespaces = shouldSyncOnlyCoreEvents
			? ['core']
			: this.dependencyService.get().map((d) => d.namespace)

		const contractResults = await this.eventStore.fetchEventContracts({
			localNamespace: namespace,
			namespaces,
			didUpdateHandler: (msg) => {
				this.ui.startLoading(msg)
			},
		})

		if (contractResults.errors.length > 0) {
			return {
				errors: contractResults.errors,
				eventContractTemplateItems: [],
				schemaTemplateItems: [],
			}
		}

		if (shouldSyncOnlyCoreEvents) {
			namespace = undefined
		} else {
			namespace = namesUtil.toKebab(namespace)
		}

		this.ui.startLoading('Building contracts...')

		const itemBuilder = new EventTemplateItemBuilder()
		const { eventContractTemplateItems, schemaTemplateItems } =
			itemBuilder.buildTemplateItems({
				contracts: contractResults.contracts,
				localNamespace: namespace,
				eventBuilderFile,
			})

		return {
			eventContractTemplateItems,
			schemaTemplateItems,
			errors: [],
		}
	}
}
