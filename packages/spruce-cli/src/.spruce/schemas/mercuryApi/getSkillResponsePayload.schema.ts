import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../schemas.types'

import skillSchema from '#spruce/schemas/spruce/v2020_07_22/skill.schema'

const getSkillResponsePayloadSchema: SpruceSchemas.MercuryApi.GetSkillResponsePayloadSchema  = {
	id: 'getSkillResponsePayload',
	namespace: 'MercuryApi',
	name: '',
	    fields: {
	            /** . */
	            'skill': {
	                type: 'schema',
	                isRequired: true,
	                options: {schema: skillSchema,}
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(getSkillResponsePayloadSchema)

export default getSkillResponsePayloadSchema
