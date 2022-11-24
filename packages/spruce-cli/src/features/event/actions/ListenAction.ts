import { EventContract } from '@sprucelabs/mercury-types'
import {
	normalizeSchemaValues,
	SchemaError,
	SchemaTemplateItem,
	SelectChoice,
} from '@sprucelabs/schema'
import {
	eventContractUtil,
	eventNameUtil,
} from '@sprucelabs/spruce-event-utils'
import {
	diskUtil,
	namesUtil,
	MERCURY_API_NAMESPACE,
} from '@sprucelabs/spruce-skill-utils'
import { SpruceSchemas } from '#spruce/schemas/schemas.types'
import eventListenActionSchema from '#spruce/schemas/spruceCli/v2020_07_22/listenEventOptions.schema'
import syncEventActionSchema from '#spruce/schemas/spruceCli/v2020_07_22/syncEventOptions.schema'
import EventTemplateItemBuilder from '../../../templateItemBuilders/EventTemplateItemBuilder'
import actionUtil from '../../../utilities/action.utility'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'
import { FetchContractsOptions } from '../stores/EventStore'

const SKILL_EVENT_NAMESPACE = 'skill'
export const CORE_EVENT_NAMESPACE = MERCURY_API_NAMESPACE

type OptionsSchema =
	SpruceSchemas.SpruceCli.v2020_07_22.ListenEventOptionsSchema
export default class ListenAction extends AbstractAction<OptionsSchema> {
	public optionsSchema: OptionsSchema = eventListenActionSchema
	public invocationMessage = 'Creating event listener... 🜒'
	public commandAliases = ['listen.event', 'create.listener']

	public async execute(
		options: SpruceSchemas.SpruceCli.v2020_07_22.ListenEventOptions
	): Promise<FeatureActionResponse> {
		const normalizedOptions = this.validateAndNormalizeOptions(options)

		try {
			let response: FeatureActionResponse = {}

			let {
				listenerDestinationDir,
				version: versionOptions,
				eventName,
				namespace,
				schemaTypesLookupDir,
			} = normalizedOptions

			this.ui.startLoading('Loading event contracts...')

			const contracts = await this.fetchEventContracts(namespace)

			this.ui.stopLoading()

			if (!namespace) {
				namespace = await this.collectNamespace(contracts)
			}

			const { eventChoicesByNamespace } =
				this.mapContractsToSelectChoices(contracts)

			if (!eventChoicesByNamespace[namespace]) {
				throw new SchemaError({
					code: 'INVALID_PARAMETERS',
					friendlyMessage: `${namespace} is not a valid event namespace. Try: \n\n${Object.keys(
						eventChoicesByNamespace
					).join('\n')}`,
					parameters: ['namespace'],
				})
			}

			if (!eventName) {
				eventName = await this.collectEvent(contracts, namespace)
			}

			const isCoreEvent = namespace === CORE_EVENT_NAMESPACE
			if (isCoreEvent) {
				namespace = undefined
			}

			const fqen = eventNameUtil.join({
				eventName,
				eventNamespace: namespace,
				version: versionOptions,
			})

			let { version } = eventNameUtil.split(fqen)

			this.assertIsValidChoice(
				eventChoicesByNamespace,
				namespace ?? 'mercury',
				eventName,
				fqen
			)

			const resolvedDestination = diskUtil.resolvePath(
				this.cwd,
				listenerDestinationDir
			)

			const resolvedVersion = await this.resolveVersion(
				version,
				resolvedDestination
			)

			const isSkillEvent = namespace !== SKILL_EVENT_NAMESPACE

			let emitPayloadSchemaTemplateItem: SchemaTemplateItem | undefined
			let responsePayloadSchemaTemplateItem: SchemaTemplateItem | undefined

			if (isSkillEvent) {
				const builder = new EventTemplateItemBuilder()
				const templateItems = builder.buildEventTemplateItemForName(
					contracts,
					eventNameUtil.join({
						eventNamespace: !isCoreEvent ? namespace : undefined,
						eventName,
						version: resolvedVersion,
					})
				)

				emitPayloadSchemaTemplateItem =
					templateItems.emitPayloadSchemaTemplateItem
				responsePayloadSchemaTemplateItem =
					templateItems.responsePayloadSchemaTemplateItem
			}

			response.files = await this.writeListener({
				schemaTypesLookupDir,
				resolvedDestination,
				version: resolvedVersion,
				eventName,
				namespace,
				emitPayloadSchemaTemplateItem,
				responsePayloadSchemaTemplateItem,
			})

			const syncResults = await this.syncListeners()

			response = actionUtil.mergeActionResults(syncResults, response)

			if (isSkillEvent) {
				const syncResults = await this.syncEvents(options)
				response = actionUtil.mergeActionResults(syncResults, response)
			}

			return response
		} catch (err: any) {
			return {
				errors: [err],
			}
		}
	}

	private async fetchEventContracts(namespace?: string) {
		const eventStore = this.Store('event')

		const skill = await this.Store('skill').loadCurrentSkill()

		const namespacesForFetch =
			namespace &&
			namespace !== SKILL_EVENT_NAMESPACE &&
			namespace !== CORE_EVENT_NAMESPACE
				? [namespace]
				: [...this.getDependencyNamespaces(), 'mercury']

		const options: FetchContractsOptions = {
			didUpdateHandler: (msg: string) => this.ui.startLoading(msg),
		}

		if (skill.slug) {
			options.localNamespace = skill.slug
		}

		if (namespacesForFetch.length > 0) {
			options.namespaces = namespacesForFetch
		}

		const { contracts } = await eventStore.fetchEventContracts(options)

		return contracts
	}

	private getDependencyNamespaces() {
		return this.Service('dependency')
			.get()
			.map((d) => d.namespace)
	}

	private async syncEvents(
		options: SpruceSchemas.SpruceCli.v2020_07_22.ListenEventOptions
	) {
		const syncOptions = normalizeSchemaValues(syncEventActionSchema, options)

		const syncResults = await this.Action('event', 'sync').execute(syncOptions)
		return syncResults
	}

	private async writeListener(options: {
		resolvedDestination: string
		schemaTypesLookupDir: string
		namespace?: string | undefined
		eventName: string
		emitPayloadSchemaTemplateItem: SchemaTemplateItem | undefined
		version: string
		responsePayloadSchemaTemplateItem: SchemaTemplateItem | undefined
	}) {
		const {
			resolvedDestination,
			schemaTypesLookupDir,
			namespace,
			eventName,
			version,
		} = options

		const resolvedSchemaTypesLookupDir = diskUtil.resolvePath(
			this.cwd,
			schemaTypesLookupDir
		)
		const writer = this.Writer('event')
		const files = await writer.writeListener(resolvedDestination, {
			...options,
			fullyQualifiedEventName: eventNameUtil.join({
				eventName,
				eventNamespace: namespace,
				version,
			}),
			schemaTypesLookupDir: resolvedSchemaTypesLookupDir,
		})

		return files
	}

	private assertIsValidChoice(
		eventChoicesByNamespace: Record<string, SelectChoice[]>,
		namespace: string,
		eventName: string | undefined,
		fqen: string
	) {
		const isValidEvent = !!eventChoicesByNamespace[namespace].find(
			(e) => e.value === eventName || e.value === fqen
		)

		if (!isValidEvent) {
			throw new SchemaError({
				code: 'INVALID_PARAMETERS',
				friendlyMessage: `${eventName} is not a valid event . Try: \n\n${eventChoicesByNamespace[
					namespace
				]
					.map((i) => i.value)
					.join('\n')}`,
				parameters: ['eventName'],
			})
		}
	}

	private async syncListeners() {
		return this.Action('event', 'sync.listeners').execute({})
	}

	private async collectEvent(
		contracts: EventContract[],
		namespace: string
	): Promise<string> {
		const eventChoices: SelectChoice[] =
			this.mapContractsToSelectChoices(contracts).eventChoicesByNamespace[
				namespace
			]

		const eventName = await this.ui.prompt({
			type: 'select',
			label: 'Select an event',
			isRequired: true,
			options: {
				choices: eventChoices,
			},
		})

		return eventName
	}

	private async collectNamespace(contracts: EventContract[]): Promise<string> {
		const { namespaceChoices } = this.mapContractsToSelectChoices(contracts)

		const namespace = await this.ui.prompt({
			type: 'select',
			label: 'Select an event namespace',
			isRequired: true,
			options: {
				choices: namespaceChoices,
			},
		})

		return namespace
	}

	private mapContractsToSelectChoices(contracts: EventContract[]) {
		const namespaceChoices: SelectChoice[] = [
			{
				label: 'Skill',
				value: SKILL_EVENT_NAMESPACE,
			},
		]

		const eventChoicesByNamespace: Record<string, SelectChoice[]> = {
			skill: [
				{
					label: 'will-boot',
					value: 'will-boot',
				},
				{
					label: 'did-boot',
					value: 'did-boot',
				},
			],
		}

		contracts.forEach((contract) => {
			const namedSignatures =
				eventContractUtil.getNamedEventSignatures(contract)

			for (const namedSig of namedSignatures) {
				const namespace = namedSig.eventNamespace ?? MERCURY_API_NAMESPACE

				if (!namespaceChoices.find((o) => o.value === namespace)) {
					namespaceChoices.push({
						label: namesUtil.toPascal(namespace),
						value: namespace,
					})
				}

				if (!eventChoicesByNamespace[namespace]) {
					eventChoicesByNamespace[namespace] = []
				}

				eventChoicesByNamespace[namespace].push({
					value: namedSig.fullyQualifiedEventName,
					label: namedSig.fullyQualifiedEventName,
				})
			}
		})

		return { eventChoicesByNamespace, namespaceChoices }
	}
}
