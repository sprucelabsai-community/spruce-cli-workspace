import { buildSchema } from '@sprucelabs/schema'

export default buildSchema({
    id: 'namedTemplateItem',
    name: 'NamedTemplateItem',
    description: 'Used to collect input on the names of a class or interface',
    fields: {
        nameReadable: {
            type: 'text',
            label: 'Readable name',
            hint: 'The name people will read',
            isRequired: true,
        },
        nameReadablePlural: {
            type: 'text',
            label: 'Readable name (plural)',
            hint: 'The plural form of the name people will read',
            isRequired: true,
        },
        nameCamel: {
            type: 'text',
            label: 'Camel case name',
            isRequired: true,
            hint: 'camelCase version of the name',
        },
        nameCamelPlural: {
            type: 'text',
            label: 'Plural camel case name',
            hint: 'camelCase version of the name',
        },
        namePascal: {
            type: 'text',
            label: 'Pascal case name',
            hint: 'PascalCase of the name',
        },
        namePascalPlural: {
            type: 'text',
            label: 'Plural Pascal case name',
            hint: 'PascalCase of the name',
        },
        nameConst: {
            type: 'text',
            label: 'Constant case name',
            hint: 'CONST_CASE of the name',
        },
        nameKebab: {
            type: 'text',
            label: 'Kebab case name',
            hint: 'kebab-case of the name',
        },
        nameSnake: {
            type: 'text',
            label: 'Snake case name',
            hint: 'snake_case of the name',
        },
        nameSnakePlural: {
            type: 'text',
            label: 'Snake case name (plural)',
            hint: 'snakes_case of the name',
        },
        description: {
            type: 'text',
            label: 'Description',
            hint: 'Describe a bit more here',
        },
    },
})
