import { EventSignature } from '@sprucelabs/mercury-types'

const eventOptions: Omit<
    EventSignature,
    | 'responsePayloadSchema'
    | 'emitPayloadSchema'
    | 'listenPermissionContract'
    | 'emitPermissionContract'
> = {
    isGlobal: true,
}

export default eventOptions
