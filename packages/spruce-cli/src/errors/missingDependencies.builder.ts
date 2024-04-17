import { buildErrorSchema, buildSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
    id: 'missingDependencies',
    name: 'Missing dependencies',
    description: '',
    fields: {
        dependencies: {
            type: 'schema',
            isRequired: true,
            isArray: true,
            options: {
                schema: buildSchema({
                    id: 'missingDependenciesDependency',
                    fields: {
                        name: {
                            type: 'text',
                            isRequired: true,
                        },
                        hint: {
                            type: 'text',
                            isRequired: true,
                        },
                    },
                }),
            },
        },
    },
})
