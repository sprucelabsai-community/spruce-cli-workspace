import { buildSchema } from '@sprucelabs/schema'
import namedTemplateItemBuilder from './namedTemplateItem.builder'
import syncErrorsOptionsBuilder from './syncErrorOptions.builder'

export default buildSchema({
    id: 'createErrorOptions',
    name: 'Create error action',
    description: 'Create a builder for your brand new error! ',
    fields: {
        ...syncErrorsOptionsBuilder.fields,
        errorBuilderDestinationDir: {
            type: 'text',
            label: 'Error builder destination directory',
            isRequired: true,
            isPrivate: true,
            hint: "Where I'll save your new builder file?",
            defaultValue: './src/errors',
        },
        nameReadable: namedTemplateItemBuilder.fields.nameReadable,
        namePascal: namedTemplateItemBuilder.fields.namePascal,
        nameCamel: namedTemplateItemBuilder.fields.nameCamel,
        description: namedTemplateItemBuilder.fields.description,
    },
})
