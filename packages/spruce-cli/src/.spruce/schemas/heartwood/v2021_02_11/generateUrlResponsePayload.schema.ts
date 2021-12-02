import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'



const generateUrlResponsePayloadSchema: SpruceSchemas.Heartwood.v2021_02_11.GenerateUrlResponsePayloadSchema  = {
	id: 'generateUrlResponsePayload',
	version: 'v2021_02_11',
	namespace: 'Heartwood',
	name: '',
	    fields: {
	            /** Url. */
	            'url': {
	                label: 'Url',
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(generateUrlResponsePayloadSchema)

export default generateUrlResponsePayloadSchema
