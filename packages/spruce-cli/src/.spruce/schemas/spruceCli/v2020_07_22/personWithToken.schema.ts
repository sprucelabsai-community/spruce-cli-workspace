import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'



const personWithTokenSchema: SpruceSchemas.SpruceCli.v2020_07_22.PersonWithTokenSchema  = {
	id: 'personWithToken',
	version: 'v2020_07_22',
	namespace: 'SpruceCli',
	name: '',
	description: 'A stripped down cli user with token details for login',
	    fields: {
	            /** Id. */
	            'id': {
	                label: 'Id',
	                type: 'id',
	                isRequired: true,
	                options: undefined
	            },
	            /** Casual name. The name you can use when talking to this person. */
	            'casualName': {
	                label: 'Casual name',
	                type: 'text',
	                isRequired: true,
	                hint: 'The name you can use when talking to this person.',
	                options: undefined
	            },
	            /** . */
	            'token': {
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	            /** Logged in. */
	            'isLoggedIn': {
	                label: 'Logged in',
	                type: 'boolean',
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(personWithTokenSchema)

export default personWithTokenSchema
