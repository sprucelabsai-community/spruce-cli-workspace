import { Optional } from '@sprucelabs/schema'
import { namesUtil } from '@sprucelabs/spruce-skill-utils'
import { FieldDefinitions } from '#spruce/schemas/fields/fields.types'
import { SpruceSchemas } from '#spruce/schemas/schemas.types'

const formUtil = {
	/** Help guess on answers */
	onWillAskQuestionHandler<
		K extends keyof SpruceSchemas.SpruceCli.v2020_07_22.NamedTemplateItem = keyof SpruceSchemas.SpruceCli.v2020_07_22.NamedTemplateItem,
		V extends Optional<SpruceSchemas.SpruceCli.v2020_07_22.NamedTemplateItem> = Optional<SpruceSchemas.SpruceCli.v2020_07_22.NamedTemplateItem>
	>(fieldName: K, fieldDefinition: FieldDefinitions, values: V) {
		switch (fieldName) {
			case 'nameCamel':
				if (!values.nameCamel) {
					fieldDefinition.defaultValue = namesUtil.toCamel(
						values.nameReadable || ''
					)
				}
				break
			case 'nameCamelPlural':
				if (!values.nameCamelPlural) {
					fieldDefinition.defaultValue = namesUtil.toPlural(
						namesUtil.toCamel(values.nameReadable || '')
					)
				}
				break
			case 'namePascal':
				if (!values.namePascal) {
					fieldDefinition.defaultValue = namesUtil.toPascal(
						values.nameCamel ?? values.nameReadable ?? ''
					)
				}

				break
			case 'namePascalPlural':
				if (!values.namePascalPlural) {
					if (values.nameCamelPlural || values.nameReadablePlural) {
						fieldDefinition.defaultValue = namesUtil.toPascal(
							values.nameCamelPlural ?? values.nameReadablePlural ?? ''
						)
					} else if (values.nameCamel || values.nameReadable) {
						fieldDefinition.defaultValue = namesUtil.toPlural(
							namesUtil.toPascal(values.nameCamel ?? values.nameReadable ?? '')
						)
					}
				}
				break
			case 'nameConst':
				if (!values.nameConst) {
					fieldDefinition.defaultValue = namesUtil.toConst(
						values.nameCamel ?? values.namePascal ?? values.nameReadable ?? ''
					)
				}
				break
			case 'nameKebab':
				if (!values.nameKebab) {
					fieldDefinition.defaultValue = namesUtil.toKebab(
						values.nameCamel ?? values.namePascal ?? values.nameReadable ?? ''
					)
				}
				break
			case 'nameSnake':
				if (!values.nameSnake) {
					fieldDefinition.defaultValue = namesUtil.toSnake(
						values.nameCamel ?? values.namePascal ?? values.nameReadable ?? ''
					)
				}
				break
			case 'nameSnakePlural':
				if (!values.nameSnake) {
					fieldDefinition.defaultValue = namesUtil.toSnake(
						values.nameCamelPlural ??
							values.namePascalPlural ??
							values.nameReadablePlural ??
							''
					)
				}
				break
		}
		return fieldDefinition
	},
}

export default formUtil
