import { FieldTemplateItem } from '@sprucelabs/schema'
import { test, assert } from '@sprucelabs/test-utils'
import FieldTemplateItemBuilder from '../../templateItemBuilders/FieldTemplateItemBuilder'
import AbstractCliTest from '../../tests/AbstractCliTest'

const localAddressField = {
	path: '/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli/node_modules/@sprucelabs/schema/build/addons/addressField.addon.js',
	registration: {
		package: '@sprucelabs/schema',
		className: 'AddressField',
		type: 'Address',
		importAs: 'SpruceSchema',
		description: 'An address with geocoding ability *coming soon*',
	},
	isLocal: true,
}

const localAddressFieldTemplateItem: FieldTemplateItem = {
	namePascal: 'AddressField',
	nameCamel: 'addressField',
	package: '#spruce/../fields/AddressField',
	className: 'AddressField',
	importAs: 'generated_import_0',
	nameReadable: 'AddressField',
	pascalType: 'Address',
	camelType: 'address',
	isLocal: true,
	description: 'An address with geocoding ability *coming soon*',
	valueTypeMapper: undefined,
}

const remoteSchemaField = {
	path: '/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli/node_modules/@sprucelabs/schema/build/addons/schemaField.addon.js',
	registration: {
		package: '@sprucelabs/schema',
		className: 'SchemaField',
		type: 'Schema',
		importAs: 'SpruceSchema',
		description: 'A way to map relationships.',
		valueTypeMapper:
			'SchemaFieldValueTypeMapper<F extends SchemaFieldFieldDefinition? F : SchemaFieldFieldDefinition, CreateEntityInstances>',
	},
	isLocal: false,
}

const remoteSchemaFieldTemplateItem = {
	namePascal: 'SchemaField',
	nameCamel: 'schemaField',
	package: '@sprucelabs/schema',
	className: 'SchemaField',
	importAs: 'SpruceSchema',
	nameReadable: 'SchemaField',
	pascalType: 'Schema',
	camelType: 'schema',
	isLocal: false,
	description: 'A way to map relationships.',
	valueTypeMapper:
		'SchemaFieldValueTypeMapper<F extends SchemaFieldFieldDefinition? F : SchemaFieldFieldDefinition, CreateEntityInstances>',
}

export default class FieldTemplateItemBuilderTest extends AbstractCliTest {
	private static readonly itemBuilder = new FieldTemplateItemBuilder()

	@test()
	protected static async canCreate() {
		assert.isTruthy(this.itemBuilder)
	}

	@test()
	protected static hasGenerateFunction() {
		assert.isFunction(this.itemBuilder.generateTemplateItems)
	}

	@test()
	protected static turnsSingleLocalFieldIntoTemplateItem() {
		const templateItems = this.itemBuilder.generateTemplateItems([
			localAddressField,
		])
		assert.isLength(templateItems, 1)
		assert.isEqualDeep(templateItems[0], localAddressFieldTemplateItem)
	}

	@test()
	protected static turnsRemoteFieldIntoTemplateItem() {
		const templateItems = this.itemBuilder.generateTemplateItems([
			remoteSchemaField,
		])
		assert.isLength(templateItems, 1)
		assert.isEqualDeep(templateItems[0], remoteSchemaFieldTemplateItem)
	}

	@test()
	protected static doesItAll() {
		const templateItems = this.itemBuilder.generateTemplateItems([
			localAddressField,
			remoteSchemaField,
		])
		assert.isLength(templateItems, 2)
		assert.isEqualDeep(templateItems[0], localAddressFieldTemplateItem)
		assert.isEqualDeep(templateItems[1], remoteSchemaFieldTemplateItem)
	}
}
