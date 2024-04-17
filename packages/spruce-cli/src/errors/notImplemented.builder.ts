import { buildErrorSchema } from '@sprucelabs/schema'

const notImplementedDefinition = buildErrorSchema({
    id: 'notImplemented',
    name: 'Not implemented',
    description: 'This feature has not been implemented',
    fields: {},
})

export default notImplementedDefinition
