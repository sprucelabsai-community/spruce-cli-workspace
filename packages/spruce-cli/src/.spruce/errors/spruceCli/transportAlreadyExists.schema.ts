import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'

const transportAlreadyExistsSchema: SpruceErrors.SpruceCli.TransportAlreadyExistsSchema =
    {
        id: 'transportAlreadyExists',
        namespace: 'SpruceCli',
        name: 'transport already exists',
        fields: {
            /** Transport name. */
            name: {
                label: 'Transport name',
                type: 'text',
                isRequired: true,
                options: undefined,
            },
        },
    }

SchemaRegistry.getInstance().trackSchema(transportAlreadyExistsSchema)

export default transportAlreadyExistsSchema
