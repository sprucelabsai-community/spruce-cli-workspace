import { coreEventContracts } from '@sprucelabs/mercury-core-events'
import { EventContract } from '@sprucelabs/mercury-types'
import { buildSchema, SchemaTemplateItem } from '@sprucelabs/schema'
import {
	MERCURY_API_NAMESPACE,
	namesUtil,
	versionUtil,
} from '@sprucelabs/spruce-skill-utils'
import { EventContractTemplateItem } from '@sprucelabs/spruce-templates'
import { test, assert } from '@sprucelabs/test'
import EventTemplateItemBuilder from '../../templateItemBuilders/EventTemplateItemBuilder'
import AbstractCliTest from '../../tests/AbstractCliTest'

const expectedVersion = versionUtil.generateVersion().dirValue

const bookContract: EventContract = {
	eventSignatures: {
		[`did-book::${expectedVersion}`]: {},
	},
}

const contractWith2Signatures: EventContract = {
	eventSignatures: {
		[`did-book::${expectedVersion}`]: {},
		[`will-book::${expectedVersion}`]: {},
	},
}

const contractWith2NamespacedSignatures: EventContract = {
	eventSignatures: {
		[`appointments.did-book::${expectedVersion}`]: {},
		[`appointments.will-book::${expectedVersion}`]: {},
	},
}

const didBookTemplateItem: EventContractTemplateItem = {
	version: expectedVersion,
	namePascal: 'DidBook',
	nameCamel: 'didBook',
	isLocal: false,
	namespace: namesUtil.toKebab(MERCURY_API_NAMESPACE),
	namespaceCamel: namesUtil.toCamel(MERCURY_API_NAMESPACE),
	namespacePascal: namesUtil.toPascal(MERCURY_API_NAMESPACE),
	imports: [
		{
			importAs: '{ buildEventContract }',
			package: '@sprucelabs/mercury-types',
		},
	],
	eventSignatures: {
		[`did-book::${expectedVersion}`]: {},
	},
}

const willBookTemplateItem: EventContractTemplateItem = {
	version: expectedVersion,
	namePascal: 'WillBook',
	nameCamel: 'willBook',
	isLocal: false,
	namespace: namesUtil.toKebab(MERCURY_API_NAMESPACE),
	imports: [
		{
			importAs: '{ buildEventContract }',
			package: '@sprucelabs/mercury-types',
		},
	],
	namespaceCamel: namesUtil.toCamel(MERCURY_API_NAMESPACE),
	namespacePascal: namesUtil.toPascal(MERCURY_API_NAMESPACE),
	eventSignatures: {
		[`will-book::${expectedVersion}`]: {},
	},
}

const didBookWithNamespaceTemplateItem: EventContractTemplateItem = {
	version: expectedVersion,
	namePascal: 'DidBook',
	nameCamel: 'didBook',
	isLocal: true,
	namespace: 'appointments',
	namespaceCamel: 'appointments',
	namespacePascal: 'Appointments',
	imports: [
		{
			importAs: '{ buildEventContract }',
			package: '@sprucelabs/mercury-types',
		},
	],
	eventSignatures: {
		[`appointments.did-book::${expectedVersion}`]: {},
	},
}

const willBookWithNamespaceTemplateItem: EventContractTemplateItem = {
	version: expectedVersion,
	namePascal: 'WillBook',
	nameCamel: 'willBook',
	isLocal: true,
	namespace: 'appointments',
	namespaceCamel: 'appointments',
	namespacePascal: 'Appointments',
	imports: [
		{
			importAs: '{ buildEventContract }',
			package: '@sprucelabs/mercury-types',
		},
	],
	eventSignatures: {
		[`appointments.will-book::${expectedVersion}`]: {},
	},
}

const relatedToRelatedToProximitySchema = buildSchema({
	id: 'relatedToRelatedToProximitySchema',
	version: expectedVersion,
	fields: {
		onlyField: {
			type: 'text',
		},
	},
})

const relatedToRelatedToProximitySchemaTemplateItem: SchemaTemplateItem = {
	namespace: 'Proximity',
	id: relatedToRelatedToProximitySchema.id,
	nameCamel: 'relatedToRelatedToProximitySchema',
	namePascal: 'RelatedToRelatedToProximitySchema',
	nameReadable: 'relatedToRelatedToProximitySchema',
	schema: {
		...relatedToRelatedToProximitySchema,
		namespace: 'Proximity',
	},
	isNested: true,
	destinationDir: '#spruce/events',
}

const relatedToProximitySchema = buildSchema({
	version: expectedVersion,
	id: 'relatedToProximitySchema',
	fields: {
		boolField: {
			type: 'boolean',
		},
		relatedToRelatedSchema: {
			type: 'schema',
			options: {
				schema: relatedToRelatedToProximitySchema,
			},
		},
	},
})

const relatedToProximitySchemaTemplateItem: SchemaTemplateItem = {
	namespace: 'Proximity',
	id: relatedToProximitySchema.id,
	nameCamel: 'relatedToProximitySchema',
	namePascal: 'RelatedToProximitySchema',
	nameReadable: 'relatedToProximitySchema',
	schema: {
		id: 'relatedToProximitySchema',
		namespace: 'Proximity',
		version: expectedVersion,
		fields: {
			boolField: {
				type: 'boolean',
			},
			relatedToRelatedSchema: {
				type: 'schema',
				options: {
					schemaIds: [
						{
							id: 'relatedToRelatedToProximitySchema',
							namespace: 'Proximity',
							version: expectedVersion,
						},
					],
				},
			},
		},
	},
	isNested: true,
	destinationDir: '#spruce/events',
}

const proximityEmitPayloadSchema = buildSchema({
	version: expectedVersion,
	id: 'proximityEmitPayload',
	fields: {
		textField: {
			type: 'text',
		},
		relatedSchema: {
			type: 'schema',
			options: {
				schema: relatedToProximitySchema,
			},
		},
	},
})

const proximityEmitPayloadTemplateItem: SchemaTemplateItem = {
	namespace: 'Proximity',
	id: proximityEmitPayloadSchema.id,
	nameCamel: 'proximityEmitPayload',
	namePascal: 'ProximityEmitPayload',
	nameReadable: 'proximityEmitPayload',
	schema: {
		id: 'proximityEmitPayload',
		namespace: 'Proximity',
		version: expectedVersion,
		fields: {
			textField: {
				type: 'text',
			},
			relatedSchema: {
				type: 'schema',
				options: {
					schemaIds: [
						{
							id: 'relatedToProximitySchema',
							namespace: 'Proximity',
							version: expectedVersion,
						},
					],
				},
			},
		},
	},
	isNested: false,
	destinationDir: '#spruce/events',
}

const contractWithEmitPayload: EventContract = {
	eventSignatures: {
		[`proximity.did-enter::${expectedVersion}`]: {
			emitPayloadSchema: proximityEmitPayloadSchema,
		},
	},
}

const expectedContractWithEmitPayloadTemplateItem: EventContractTemplateItem = {
	namePascal: 'DidEnter',
	nameCamel: 'didEnter',
	namespace: 'proximity',
	isLocal: false,
	version: expectedVersion,
	namespaceCamel: 'proximity',
	namespacePascal: 'Proximity',
	imports: [
		{
			package: `#spruce/schemas/proximity/${expectedVersion}/proximityEmitPayload.schema`,
			importAs: 'proximityEmitPayloadSchema',
		},
		{
			importAs: '{ buildEventContract }',
			package: '@sprucelabs/mercury-types',
		},
	],
	eventSignatures: {
		[`proximity.did-enter::${expectedVersion}`]: {
			emitPayloadSchema: {
				...proximityEmitPayloadTemplateItem,
			},
		},
	},
}

export default class EventTemplateItemBuilderTest extends AbstractCliTest {
	private static itemBuilder: EventTemplateItemBuilder

	protected static async beforeEach() {
		await super.beforeEach()
		this.itemBuilder = new EventTemplateItemBuilder()
	}

	@test()
	protected static async canCreateNewItemBuilder() {
		assert.isTruthy(this.itemBuilder)
	}

	@test()
	protected static async hasGenerateFunction() {
		assert.isFunction(this.itemBuilder.buildTemplateItems)
	}

	@test()
	protected static turnsSingleContractIntoTemplateItem() {
		const { eventContractTemplateItems } = this.itemBuilder.buildTemplateItems({
			contracts: [bookContract],
			localNamespace: 'test-namespace',
		})

		const actual = eventContractTemplateItems[0]

		assert.isEqualDeep(actual, didBookTemplateItem)
	}

	@test(
		'builds emit payload schema into a template item',
		[contractWithEmitPayload],
		[expectedContractWithEmitPayloadTemplateItem],
		[
			relatedToRelatedToProximitySchemaTemplateItem,
			relatedToProximitySchemaTemplateItem,
			proximityEmitPayloadTemplateItem,
		]
	)
	@test(
		'turns 1 contract with 2 event signature into 2 template items',
		[contractWith2Signatures],
		[didBookTemplateItem, willBookTemplateItem]
	)
	@test(
		'turns 2 contract with 2 event signature into 4 template items',
		[contractWith2Signatures, contractWith2Signatures],
		[
			didBookTemplateItem,
			didBookTemplateItem,
			willBookTemplateItem,
			willBookTemplateItem,
		]
	)
	@test(
		'turns 1 contract with 2 namespaced event signatures to 2 template items',
		[contractWith2NamespacedSignatures],
		[didBookWithNamespaceTemplateItem, willBookWithNamespaceTemplateItem]
	)
	protected static generateItems(
		contracts: EventContract[],
		expectedEventContractTemplateItems: EventContractTemplateItem[],
		expectedSchemaTemplateItems: SchemaTemplateItem[] = []
	) {
		const { eventContractTemplateItems, schemaTemplateItems } =
			this.itemBuilder.buildTemplateItems({
				contracts,
				localNamespace: 'appointments',
			})

		assert.isEqualDeep(
			eventContractTemplateItems,
			expectedEventContractTemplateItems
		)

		assert.isEqualDeep(schemaTemplateItems, expectedSchemaTemplateItems)
	}

	@test()
	protected static canPullEventContractSchemaFromCoreEventContract() {
		const { schemaTemplateItems } = this.itemBuilder.buildTemplateItems({
			contracts: [
				{
					eventSignatures: {
						'register-events':
							coreEventContracts[0].eventSignatures['can-listen::v2020_12_25'],
					},
				},
			],
			localNamespace: 'testing',
		})

		const match = schemaTemplateItems.find((item) => item.id === 'eventSource')
		assert.isTruthy(match)
	}

	@test()
	protected static sortsEventsAlphabetically() {
		const { eventContractTemplateItems } = this.itemBuilder.buildTemplateItems({
			contracts: [
				{
					eventSignatures: {
						'zebra-cheeta': {},
						'register-events':
							coreEventContracts[0].eventSignatures['can-listen::v2020_12_25'],
					},
				},
			],
			localNamespace: 'testing',
		})

		assert.isEqual(eventContractTemplateItems[0].nameCamel, 'registerEvents')
		assert.isEqual(eventContractTemplateItems[1].nameCamel, 'zebraCheeta')
	}
}
