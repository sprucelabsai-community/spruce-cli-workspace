/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	TemplateRenderAs,
	IFieldTemplateItem,
	ISchemaDefinition,
} from '@sprucelabs/schema'
import handlebars from 'handlebars'
import { upperFirst } from 'lodash'
import { FieldDefinition } from '#spruce/schemas/fields/fields.types'

handlebars.registerHelper('valueTypeGenerator', function (
	fieldDefinition:
		| FieldDefinition
		| NonNullable<ISchemaDefinition['dynamicKeySignature']>,
	renderAs: TemplateRenderAs,
	func: 'generateValueTypeGeneratorType' | 'generateTypeLiteral',
	options: {
		data: {
			root: {
				fieldTemplateItems: IFieldTemplateItem[]
			}
		}
	}
) {
	const {
		data: {
			root: { fieldTemplateItems },
		},
	} = options

	const match = fieldTemplateItems.filter(
		(item) => item.camelType === fieldDefinition.type
	)[0]

	if (!match) {
		throw new Error(`Could not find field for type ${fieldDefinition.type}`)
	}

	const type = handlebars.helpers.fieldTypeEnum(fieldDefinition, options)
	const fieldDefinitionCopy = { ...fieldDefinition }
	delete (fieldDefinitionCopy as ISchemaDefinition['dynamicKeySignature'])?.key

	const def = JSON.stringify({
		...fieldDefinitionCopy,
		type: '{{TYPE_ENUM}}',
	}).replace('"{{TYPE_ENUM}}"', type)

	return `${func}(${def}, TemplateRenderAs.${upperFirst(renderAs)}, "${match.importAs}")`
})
