/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	TemplateRenderAs,
	IFieldTemplateItem,
	ISchema,
} from '@sprucelabs/schema'
import handlebars from 'handlebars'
import { upperFirst } from 'lodash'
import { FieldDefinition } from '#spruce/schemas/fields/fields.types'

handlebars.registerHelper(
	'valueTypeGenerator',
	function (
		fieldDefinition:
			| FieldDefinition
			| NonNullable<ISchema['dynamicFieldSignature']>,
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
			throw new Error(
				`valueTypeGenerator.addon could not find a fieldTemplateItem with type ${fieldDefinition.type}`
			)
		}

		const type = handlebars.helpers.fieldTypeEnum(fieldDefinition, options)
		const fieldDefinitionCopy = { ...fieldDefinition }
		// @ts-ignore
		delete (fieldDefinitionCopy as ISchema['dynamicFieldSignature'])?.keyName

		const def = JSON.stringify({
			...fieldDefinitionCopy,
			type: '{{TYPE_ENUM}}',
		}).replace('"{{TYPE_ENUM}}"', type)

		return `${func}(${def}, TemplateRenderAs.${upperFirst(renderAs)}, "${
			match.importAs
		}")`
	}
)
