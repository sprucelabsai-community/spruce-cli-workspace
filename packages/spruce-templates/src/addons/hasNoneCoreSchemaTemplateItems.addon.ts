import { ISchemaTemplateItem } from '@sprucelabs/schema'
import { CORE_NAMESPACE } from '@sprucelabs/spruce-skill-utils'
import handlebars from 'handlebars'

handlebars.registerHelper(
	'hasNonCoreSchemaTemplateItems',
	function (schemaTemplateItems: ISchemaTemplateItem[]) {
		return (
			schemaTemplateItems.filter((i) => i.namespace !== CORE_NAMESPACE).length >
			0
		)
	}
)
