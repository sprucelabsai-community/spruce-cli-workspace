import { SpruceSchemas } from '@sprucelabs/mercury-types'
import {
	normalizeSchemaToIdWithVersion,
	Schema,
	SchemaTemplateItem,
} from '@sprucelabs/schema'
import { diskUtil, namesUtil } from '@sprucelabs/spruce-skill-utils'
import { EventContractTemplateItem } from '@sprucelabs/spruce-templates'
import globby from 'globby'
import { isEqual } from 'lodash'
import SpruceError from '../../../errors/SpruceError'
import EventTemplateItemBuilder from '../../../templateItemBuilders/EventTemplateItemBuilder'
import { GraphicsInterface } from '../../../types/cli.types'
import { FeatureActionResponse } from '../../features.types'
import SkillStore from '../../skill/stores/SkillStore'
import validateAndNormalizeUtil from '../../validateAndNormalize.utility'
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

	public constructor(options: {
		optionsSchema: OptionsSchema
		ui: GraphicsInterface
		eventGenerator: EventWriter
		cwd: string
		eventStore: EventStore
		skillStore: SkillStore
	}) {
		this.optionsSchema = options.optionsSchema
		this.ui = options.ui
		this.eventWriter = options.eventGenerator
		this.cwd = options.cwd
		this.eventStore = options.eventStore
		this.skillStore = options.skillStore
	}

	public async fetchAndWriteContracts(
		options: Options
	): Promise<FeatureActionResponse> {
		const normalizedOptions = validateAndNormalizeUtil.validateAndNormalize(
			this.optionsSchema,
			options
		)


		debugger
		const { contractDestinationDir } = normalizedOptions

		const resolvedDestination = diskUtil.resolvePath(
			this.cwd,
			contractDestinationDir
		)

		const { errors, schemaTemplateItems, eventContractTemplateItems } =
			await this.fetchAndBuildTemplateItems(
				options.shouldSyncOnlyCoreEvents ?? false
			)

		if (errors && errors?.length > 0) {
			return {
				errors,
			}
		}

		this.ui.startLoading('Generating contracts...')

		debugger

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
			await this.fetchAndBuildTemplateItems(shouldSyncOnlyCoreEvents)

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



	private async fetchAndBuildTemplateItems(shouldSyncOnlyCoreEvents = false) {
		this.ui.startLoading('Loading skill details...')

		let namespace: string | undefined =
			await this.skillStore.loadCurrentSkillsNamespace()

		this.ui.startLoading('Fetching event contracts...')

		const contractResults = await this.eventStore.fetchEventContracts({
			localNamespace: namespace,
		})

		if (contractResults.errors.length > 0) {
			return {
				errors: contractResults.errors,
				eventContractTemplateItems: [],
				schemaTemplateItems: [],
			}
		}

		if (shouldSyncOnlyCoreEvents) {
			contractResults.contracts = [contractResults.contracts[0]]
			namespace = undefined
		} else {
			contractResults.contracts.shift()
			namespace = namesUtil.toKebab(namespace)
		}

		this.ui.startLoading('Building contracts...')

		const itemBuilder = new EventTemplateItemBuilder()
		const { eventContractTemplateItems, schemaTemplateItems } =
			itemBuilder.buildTemplateItems(contractResults.contracts, namespace)

		return {
			eventContractTemplateItems,
			schemaTemplateItems,
			errors: [],
		}
	}
}
