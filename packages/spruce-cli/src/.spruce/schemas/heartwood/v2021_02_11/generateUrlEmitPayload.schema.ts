import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'



const generateUrlEmitPayloadSchema: SpruceSchemas.Heartwood.v2021_02_11.GenerateUrlEmitPayloadSchema  = {
	id: 'generateUrlEmitPayload',
	version: 'v2021_02_11',
	namespace: 'Heartwood',
	name: '',
	    fields: {
	            /** Load args. */
	            'args': {
	                label: 'Load args',
	                type: 'raw',
	                options: {valueType: `Record<string, any>`,}
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(generateUrlEmitPayloadSchema)

export default generateUrlEmitPayloadSchema
