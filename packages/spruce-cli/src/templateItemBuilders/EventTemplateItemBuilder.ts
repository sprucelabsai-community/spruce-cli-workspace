import { EventContract } from '@sprucelabs/mercury-types'
import { Schema, SchemaTemplateItem } from '@sprucelabs/schema'
import {
	eventContractUtil,
	NamedEventSignature,
} from '@sprucelabs/spruce-event-utils'
import {
	MERCURY_API_NAMESPACE,
	namesUtil,
} from '@sprucelabs/spruce-skill-utils'
import {
	EventContractTemplateItem,
	EventSignatureTemplateItem,
} from '@sprucelabs/spruce-templates'
import SpruceError from '../errors/SpruceError'
import schemaDiskUtil from '../features/schema/utilities/schemaDisk.utility'
import SchemaTemplateItemBuilder from './SchemaTemplateItemBuilder'

export default class EventTemplateItemBuilder {
	public buildTemplateItems(
		contracts: EventContract[],
		localNamespace: string
	): {
		eventContractTemplateItems: EventContractTemplateItem[]
		schemaTemplateItems: SchemaTemplateItem[]
	} {
		const eventContractTemplateItems: EventContractTemplateItem[] = []
		const schemaTemplateItems: SchemaTemplateItem[] = []

		for (const contract of contracts) {
			const {
				schemaTemplateItems: schemaItems,
				eventContractTemplateItems: contractItems,
			} = this.buildTemplateItemsForContract(contract, localNamespace)

			eventContractTemplateItems.push(...contractItems)
			schemaTemplateItems.push(...schemaItems)
		}

		return { eventContractTemplateItems, schemaTemplateItems }
	}

	public buildEventTemplateItemForName(
		contracts: EventContract[],
		fullyQualifiedEventName: string
	): {
		responsePayloadSchemaTemplateItem: SchemaTemplateItem | undefined
		emitPayloadSchemaTemplateItem: SchemaTemplateItem | undefined
	} {
		for (const contract of contracts) {
			const namedSignatures = eventContractUtil.getNamedEventSignatures(
				contract
			)

			for (const namedSig of namedSignatures) {
				if (namedSig.fullyQualifiedEventName === fullyQualifiedEventName) {
					const schemaTemplateItems: SchemaTemplateItem[] = this.mapEventSigsToSchemaTemplateItems(
						namedSignatures
					)

					const signatureTemplateItem: EventSignatureTemplateItem = this.buildEventSigTemplateItem(
						namedSig,
						schemaTemplateItems
					)

					return {
						emitPayloadSchemaTemplateItem:
							signatureTemplateItem.emitPayloadSchema,
						responsePayloadSchemaTemplateItem:
							signatureTemplateItem.responsePayloadSchema,
					}
				}
			}
		}

		throw new SpruceError({
			code: 'INVALID_PARAMETERS',
			parameters: ['fullyQualifiedEventName'],
		})
	}

	private buildTemplateItemsForContract(
		contract: EventContract,
		localNamespace: string
	): {
		eventContractTemplateItems: EventContractTemplateItem[]
		schemaTemplateItems: SchemaTemplateItem[]
	} {
		const namedSignatures = eventContractUtil.getNamedEventSignatures(contract)

		const schemaTemplateItems: SchemaTemplateItem[] = this.mapEventSigsToSchemaTemplateItems(
			namedSignatures
		)

		const eventContractTemplateItems: EventContractTemplateItem[] = []

		for (const namedSig of namedSignatures) {
			const item: EventContractTemplateItem = this.buildTemplateItemForEventSignature(
				namedSig,
				schemaTemplateItems,
				namedSig.eventNamespace === localNamespace
			)

			eventContractTemplateItems.push(item)
		}

		return {
			eventContractTemplateItems,
			schemaTemplateItems,
		}
	}

	private buildTemplateItemForEventSignature(
		namedSig: NamedEventSignature,
		schemaTemplateItems: SchemaTemplateItem[],
		isLocal: boolean
	) {
		const namespacePascal = this.sigToNamespacePascal(namedSig)

		const signatureTemplateItem: EventSignatureTemplateItem = this.buildEventSigTemplateItem(
			namedSig,
			schemaTemplateItems
		)

		const item: EventContractTemplateItem = {
			nameCamel: namesUtil.toCamel(namedSig.eventName),
			namePascal: namesUtil.toPascal(namedSig.eventName),
			version: namedSig.version ?? '***MISSING***',
			isLocal,
			namespace: namesUtil.toKebab(
				namedSig.eventNamespace ?? MERCURY_API_NAMESPACE
			),
			namespaceCamel: namesUtil.toCamel(
				namedSig.eventNamespace ?? MERCURY_API_NAMESPACE
			),
			imports: [
				signatureTemplateItem.emitPayloadSchema as SchemaTemplateItem,
				signatureTemplateItem.responsePayloadSchema as SchemaTemplateItem,
			]
				.filter((i) => !!i)
				.map((item: SchemaTemplateItem) => ({
					package: schemaDiskUtil.resolvePath({
						destination: '#spruce/schemas',
						schema: item.schema,
						shouldIncludeFileExtension: false,
					}),
					importAs: `${item.nameCamel}Schema`,
				})),
			namespacePascal,
			eventSignatures: {
				[namedSig.fullyQualifiedEventName]: signatureTemplateItem,
			},
		}

		if (
			namedSig.signature.listenPermissionContract ||
			namedSig.signature.emitPermissionContract
		) {
			item.imports.push({
				importAs: '{ buildPermissionContract }',
				package: '@sprucelabs/mercury-types',
			})
		}

		return item
	}

	private buildEventSigTemplateItem(
		namedSig: NamedEventSignature,
		schemaItems: SchemaTemplateItem[]
	) {
		const {
			emitPayloadSchema,
			responsePayloadSchema,
			...signature
		} = namedSig.signature

		const signatureTemplateItem: EventSignatureTemplateItem = { ...signature }

		if (emitPayloadSchema) {
			signatureTemplateItem.emitPayloadSchema = schemaItems.find(
				(i) => i.id === emitPayloadSchema.id
			)
		}

		if (responsePayloadSchema) {
			signatureTemplateItem.responsePayloadSchema = schemaItems.find(
				(i) => i.id === responsePayloadSchema.id
			)
		}
		return signatureTemplateItem
	}

	private mapEventSigsToSchemaTemplateItems(
		namedSignatures: NamedEventSignature[]
	) {
		const schemasByNamespace: Record<
			string,
			Schema[]
		> = this.mapEventSigsToSchemasByNampace(namedSignatures)

		const schemaTemplateItemBuilder = new SchemaTemplateItemBuilder('Cli')
		const schemaItems: SchemaTemplateItem[] = schemaTemplateItemBuilder.buildTemplateItems(
			schemasByNamespace,
			'#spruce/events'
		)

		return schemaItems
	}

	private mapEventSigsToSchemasByNampace(
		namedSignatures: NamedEventSignature[]
	) {
		const schemasByNamespace: Record<string, Schema[]> = {}

		for (const namedSig of namedSignatures) {
			const namespacePascal = this.sigToNamespacePascal(namedSig)
			const { emitPayloadSchema, responsePayloadSchema } = namedSig.signature

			if (!schemasByNamespace[namespacePascal]) {
				schemasByNamespace[namespacePascal] = []
			}

			if (emitPayloadSchema) {
				schemasByNamespace[namespacePascal].push({
					version: namedSig.version,
					...emitPayloadSchema,
				})
			}

			if (responsePayloadSchema) {
				schemasByNamespace[namespacePascal].push({
					version: namedSig.version,
					...responsePayloadSchema,
				})
			}
		}

		return schemasByNamespace
	}

	private sigToNamespacePascal(namedSig: NamedEventSignature) {
		return namesUtil.toPascal(namedSig.eventNamespace ?? MERCURY_API_NAMESPACE)
	}
}
