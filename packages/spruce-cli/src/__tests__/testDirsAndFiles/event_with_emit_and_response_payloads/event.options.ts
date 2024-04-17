import { EventSignature } from '@sprucelabs/mercury-types'

type Options = Omit<
    EventSignature,
    | 'responsePayloadSchema'
    | 'emitPayloadSchema'
    | 'listenPermissionContract'
    | 'emitPermissionContract'
>

const eventOptions: Options = {
    isGlobal: false,
}

export default eventOptions
