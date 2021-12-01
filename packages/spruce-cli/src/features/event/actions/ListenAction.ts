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
				eventNamespace,
				schemaTypesLookupDir,
				contractDestinationDir,
			} = normalizedOptions

			this.ui.startLoading('Loading event contracts...')

			const eventStore = this.Store('event')

			const skill = await this.Store('skill').loadCurrentSkill()

			const { contracts } = skill.slug
				? await eventStore.fetchEventContracts({
						localNamespace: skill.slug,
						namespaces: eventNamespace ? [eventNamespace] : undefined,
						didUpdateHandler: (msg: string) => this.ui.startLoading(msg),
				  })
				: await eventStore.fetchEventContracts({
						namespaces: eventNamespace ? [eventNamespace] : undefined,
						didUpdateHandler: (msg: string) => this.ui.startLoading(msg),
				  })

			this.ui.stopLoading()

			if (!eventNamespace) {
				eventNamespace = await this.collectNamespace(contracts)
			}

			const { eventChoicesByNamespace } =
				this.mapContractsToSelectChoices(contracts)

			if (!eventChoicesByNamespace[eventNamespace]) {
				throw new SchemaError({
					code: 'INVALID_PARAMETERS',
					friendlyMessage: `${eventNamespace} is not a valid event namespace. Try: \n\n${Object.keys(
						eventChoicesByNamespace
					).join('\n')}`,
					parameters: ['eventNamespace'],
				})
			}

			if (!eventName) {
				eventName = await this.collectEvent(contracts, eventNamespace)
			}

			const fqen = eventNameUtil.join({
				eventName,
				eventNamespace,
				version: versionOptions,
			})

			let { version } = eventNameUtil.split(fqen)

			const isValidEvent = !!eventChoicesByNamespace[eventNamespace].find(
				(e) => e.value === eventName || e.value === fqen
			)

			if (!isValidEvent) {
				throw new SchemaError({
					code: 'INVALID_PARAMETERS',
					friendlyMessage: `${eventName} is not a valid event . Try: \n\n${eventChoicesByNamespace[
						eventNamespace
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

			const isSkillEvent = eventNamespace !== SKILL_EVENT_NAMESPACE

			let emitPayloadSchemaTemplateItem: SchemaTemplateItem | undefined
			let responsePayloadSchemaTemplateItem: SchemaTemplateItem | undefined

			if (isSkillEvent) {
				const builder = new EventTemplateItemBuilder()
				const templateItems = builder.buildEventTemplateItemForName(
					contracts,
					eventNameUtil.join({
						eventNamespace,
						eventName,
						version: resolvedVersion,
					})
				)

				emitPayloadSchemaTemplateItem =
					templateItems.emitPayloadSchemaTemplateItem
				responsePayloadSchemaTemplateItem =
					templateItems.responsePayloadSchemaTemplateItem
			}

			const generator = this.Writer('event')
			const results = await generator.writeListener(resolvedDestination, {
				...normalizedOptions,
				version: resolvedVersion,
				eventName,
				eventNamespace,
				fullyQualifiedEventName: eventNameUtil.join({
					eventName,
					eventNamespace,
					version: resolvedVersion,
				}),
				emitPayloadSchemaTemplateItem,
				contractDestinationDir,
				responsePayloadSchemaTemplateItem,
				schemaTypesLookupDir: resolvedSchemaTypesLookupDir,
			})

			response.files = results

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

	private async collectEvent(
		contracts: EventContract[],
		eventNamespace: string
	): Promise<string> {
		const eventChoices: SelectChoice[] =
			this.mapContractsToSelectChoices(contracts).eventChoicesByNamespace[
				eventNamespace
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

		const eventNamespace = await this.ui.prompt({
			type: 'select',
			label: 'Select an event namespace',
			isRequired: true,
			options: {
				choices: namespaceChoices,
			},
		})

		return eventNamespace
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
