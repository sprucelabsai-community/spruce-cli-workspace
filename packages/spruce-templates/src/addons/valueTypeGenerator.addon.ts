/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { TemplateRenderAs, IFieldTemplateItem } from '@sprucelabs/schema'
import handlebars from 'handlebars'
import { FieldDefinition } from '#spruce/schemas/fields/fields.types'

handlebars.registerHelper('valueTypeGenerator', function(
	fieldDefinition: FieldDefinition,
	renderAs: TemplateRenderAs,
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
			root: { fieldTemplateItems }
		}
	} = options

	debugger

	const match = fieldTemplateItems.filter(
		item => item.camelType === fieldDefinition.type
	)[0]

	if (!match) {
		throw new Error(`Could not find field for type ${fieldDefinition.type}`)
	}

	return `generateType(TemplateRenderAs.${renderAs}, "${match.importAs}")`
})
