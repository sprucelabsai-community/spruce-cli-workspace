import { buildSchema } from '@sprucelabs/schema'

const myFantasticallyAmazingEventEmitPayloadBuilder = buildSchema({
    id: 'myFantasticallyAmazingEventEmitTarget',
    fields: {
        tacoId: {
            type: 'id',
            isRequired: true,
        },
    },
})

export default myFantasticallyAmazingEventEmitPayloadBuilder
