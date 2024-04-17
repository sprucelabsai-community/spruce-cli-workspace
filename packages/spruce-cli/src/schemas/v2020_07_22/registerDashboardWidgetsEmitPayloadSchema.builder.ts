import { buildSchema } from '@sprucelabs/schema'

export default buildSchema({
    id: 'registerDashboardWidgetsEmitPayloadSchema',
    name: 'register dashboard widgets emit payload schema',
    description: '',
    importsWhenLocal: [
        "import { BaseWidget } from '#spruce/../widgets/types/widgets.types'",
    ],
    fields: {
        widgets: {
            type: 'raw',
            options: {
                valueType: 'BaseWidget',
            },
        },
    },
})
