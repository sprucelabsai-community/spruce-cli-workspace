import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'

const viewPluginAlreadyExistsSchema: SpruceErrors.SpruceCli.ViewPluginAlreadyExistsSchema =
    {
        id: 'viewPluginAlreadyExists',
        namespace: 'SpruceCli',
        name: 'View plugin already exists',
        fields: {
            /** . */
            name: {
                type: 'text',
                isRequired: true,
                options: undefined,
            },
        },
    }

SchemaRegistry.getInstance().trackSchema(viewPluginAlreadyExistsSchema)

export default viewPluginAlreadyExistsSchema
