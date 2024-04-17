import { buildSchema } from '@sprucelabs/schema'
import namedTemplateItemBuilder from './namedTemplateItem.builder'

export default buildSchema({
    id: 'createConversationTopicOptions',
    name: 'Create conversation options',
    description: 'Define a topic you want to discuss.',
    fields: {
        nameReadable: {
            ...namedTemplateItemBuilder.fields.nameReadable,
            label: 'Topic',
            hint: 'What should we talk about or try and get done, e.g. Book an appointment or tell a knock knock joke.',
        },
        nameCamel: namedTemplateItemBuilder.fields.nameCamel,
    },
})
