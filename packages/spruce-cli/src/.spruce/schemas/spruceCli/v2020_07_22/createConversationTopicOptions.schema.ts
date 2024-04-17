import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'

const createConversationTopicOptionsSchema: SpruceSchemas.SpruceCli.v2020_07_22.CreateConversationTopicOptionsSchema =
    {
        id: 'createConversationTopicOptions',
        version: 'v2020_07_22',
        namespace: 'SpruceCli',
        name: 'Create conversation options',
        description: 'Define a topic you want to discuss.',
        fields: {
            /** Topic. What should we talk about or try and get done, e.g. Book an appointment or tell a knock knock joke. */
            nameReadable: {
                label: 'Topic',
                type: 'text',
                isRequired: true,
                hint: 'What should we talk about or try and get done, e.g. Book an appointment or tell a knock knock joke.',
                options: undefined,
            },
            /** Camel case name. camelCase version of the name */
            nameCamel: {
                label: 'Camel case name',
                type: 'text',
                isRequired: true,
                hint: 'camelCase version of the name',
                options: undefined,
            },
        },
    }

SchemaRegistry.getInstance().trackSchema(createConversationTopicOptionsSchema)

export default createConversationTopicOptionsSchema
