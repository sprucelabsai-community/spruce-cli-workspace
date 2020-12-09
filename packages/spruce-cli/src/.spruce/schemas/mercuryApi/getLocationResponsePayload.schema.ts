import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../schemas.types'

import locationSchema from '#spruce/schemas/spruce/v2020_07_22/location.schema'

const getLocationResponsePayloadSchema: SpruceSchemas.MercuryApi.GetLocationResponsePayloadSchema  = {
	id: 'getLocationResponsePayload',
	namespace: 'MercuryApi',
	name: '',
	    fields: {
	            /** . */
	            'location': {
	                type: 'schema',
	                isRequired: true,
	                options: {schema: locationSchema,}
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(getLocationResponsePayloadSchema)

export default getLocationResponsePayloadSchema
