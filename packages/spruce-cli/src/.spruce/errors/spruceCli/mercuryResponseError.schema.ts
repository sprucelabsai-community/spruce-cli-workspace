import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const mercuryResponseErrorSchema: SpruceErrors.SpruceCli.MercuryResponseErrorSchema  = {
	id: 'mercuryResponseError',
	namespace: 'SpruceCli',
	name: 'Mercury response error',
	    fields: {
	            /** . */
	            'responseErrors': {
	                type: 'raw',
	                isRequired: true,
	                isArray: true,
	                options: {valueType: `AbstractSpruceError<any>`,}
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(mercuryResponseErrorSchema)

export default mercuryResponseErrorSchema
