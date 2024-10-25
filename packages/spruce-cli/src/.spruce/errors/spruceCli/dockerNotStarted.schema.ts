import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const dockerNotStartedSchema: SpruceErrors.SpruceCli.DockerNotStartedSchema  = {
	id: 'dockerNotStarted',
	namespace: 'SpruceCli',
	name: 'Docker not started',
	    fields: {
	    }
}

SchemaRegistry.getInstance().trackSchema(dockerNotStartedSchema)

export default dockerNotStartedSchema
