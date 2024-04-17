import { buildSchema } from '@sprucelabs/schema'

export default buildSchema({
    id: 'hasImports2',
    importsWhenLocal: [
        "import { BaseWidget } from '#spruce/../widgets/widgets.types'",
    ],
    fields: {
        name: {
            type: 'raw',
            options: {
                valueType: 'BaseWidget',
            },
        },
    },
})
