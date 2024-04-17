import { buildSchema } from '@sprucelabs/schema'

const myFantasticallyAmazingEventEmitPayloadBuilder = buildSchema({
    id: 'myFantasticallyAmazingEventEmitPayload',
    fields: {
        aRequiredField: {
            type: 'text',
            isRequired: true,
        },
    },
})

export default myFantasticallyAmazingEventEmitPayloadBuilder
