import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const noOrganizationsFoundSchema: SpruceErrors.SpruceCli.NoOrganizationsFoundSchema  = {
	id: 'noOrganizationsFound',
	namespace: 'SpruceCli',
	name: 'no organizations found',
	    fields: {
	    }
}

SchemaRegistry.getInstance().trackSchema(noOrganizationsFoundSchema)

export default noOrganizationsFoundSchema
