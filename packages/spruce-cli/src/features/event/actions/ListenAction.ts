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
import ListenerTemplateItemBuilder from '../builders/ListenerTemplateItemBuilder'

const SKILL_EVENT_NAMESPACE = 'skill'
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
				contractDestinationDir,
			} = normalizedOptions

			this.ui.startLoading('Loading event contracts...')

			const eventStore = this.Store('event')

			const skill = await this.Store('skill').loadCurrentSkill()

			const namespacesForFetch =
				namespace && namespace !== 'skill' ? [namespace] : undefined

			const { contracts } = skill.slug
				? await eventStore.fetchEventContracts({
						localNamespace: skill.slug,
						namespaces: namespacesForFetch,
						didUpdateHandler: (msg: string) => this.ui.startLoading(msg),
				  })
				: await eventStore.fetchEventContracts({
						namespaces: namespacesForFetch,
						didUpdateHandler: (msg: string) => this.ui.startLoading(msg),
				  })

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

			const fqen = eventNameUtil.join({
				eventName,
				eventNamespace: namespace,
				version: versionOptions,
			})

			let { version } = eventNameUtil.split(fqen)

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

			const resolvedDestination = diskUtil.resolvePath(
				this.cwd,
				listenerDestinationDir
			)

			const resolvedVersion = await this.resolveVersion(
				version,
				resolvedDestination
			)

			const resolvedSchemaTypesLookupDir = diskUtil.resolvePath(
				this.cwd,
				schemaTypesLookupDir
			)

			const isSkillEvent = namespace !== SKILL_EVENT_NAMESPACE

			let emitPayloadSchemaTemplateItem: SchemaTemplateItem | undefined
			let responsePayloadSchemaTemplateItem: SchemaTemplateItem | undefined

			if (isSkillEvent) {
				const builder = new EventTemplateItemBuilder()
				const templateItems = builder.buildEventTemplateItemForName(
					contracts,
					eventNameUtil.join({
						eventNamespace: namespace,
						eventName,
						version: resolvedVersion,
					})
				)

				emitPayloadSchemaTemplateItem =
					templateItems.emitPayloadSchemaTemplateItem
				responsePayloadSchemaTemplateItem =
					templateItems.responsePayloadSchemaTemplateItem
			}

			const writer = this.Writer('event')
			response.files = await writer.writeListener(resolvedDestination, {
				...normalizedOptions,
				version: resolvedVersion,
				eventName,
				eventNamespace: namespace,
				fullyQualifiedEventName: eventNameUtil.join({
					eventName,
					eventNamespace: namespace,
					version: resolvedVersion,
				}),
				emitPayloadSchemaTemplateItem,
				contractDestinationDir,
				responsePayloadSchemaTemplateItem,
				schemaTypesLookupDir: resolvedSchemaTypesLookupDir,
			})

			const mapFiles = await this.writeMapFile()

			response.files = [...response.files, ...mapFiles]

			if (isSkillEvent) {
				const syncOptions = normalizeSchemaValues(
					syncEventActionSchema,
					options
				)

				const syncResults = await this.Action('event', 'sync').execute(
					syncOptions
				)

				response = actionUtil.mergeActionResults(syncResults, response)
			}

			return response
		} catch (err) {
			return {
				errors: [err],
			}
		}
	}

	private async writeMapFile() {
		const listeners = await this.Store('listener').loadListeners()
		const builder = new ListenerTemplateItemBuilder()

		const templateItems = builder.buildTemplateItems({
			listeners,
			cwd: this.cwd,
		})

		return this.Writer('event').writeListenerMap(
			diskUtil.resolveHashSprucePath(this.cwd, 'events'),
			{
				listeners: templateItems,
			}
		)
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
