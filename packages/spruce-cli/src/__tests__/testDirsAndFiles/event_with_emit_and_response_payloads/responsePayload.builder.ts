import { buildSchema } from '@sprucelabs/schema'

const myFantasticallyAmazingEventResponsePayloadBuilder = buildSchema({
    id: 'myFantasticallyAmazingEventResponsePayload',
    fields: {
        anotherRequiredField: {
            type: 'text',
            isRequired: true,
        },
    },
})

export default myFantasticallyAmazingEventResponsePayloadBuilder
