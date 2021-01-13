import { SchemaRegistry } from '@sprucelabs/schema'
import personSchema from '#spruce/schemas/spruce/v2020_07_22/person.schema'
import skillSchema from '#spruce/schemas/spruce/v2020_07_22/skill.schema'
import { SpruceSchemas } from '../../schemas.types'

const authSchemaSchema: SpruceSchemas.MercuryApi.v2020_12_25.AuthSchemaSchema = {
	id: 'authSchema',
	version: 'v2020_12_25',
	namespace: 'MercuryApi',
	name: '',
	fields: {
		/** . */
		person: {
			type: 'schema',
			options: { schema: personSchema },
		},
		/** . */
		skill: {
			type: 'schema',
			options: { schema: skillSchema },
		},
	},
}

SchemaRegistry.getInstance().trackSchema(authSchemaSchema)

export default authSchemaSchema
