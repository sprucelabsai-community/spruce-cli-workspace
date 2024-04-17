import { EventContract } from '@sprucelabs/mercury-types'
import { eventContractUtil } from '@sprucelabs/spruce-event-utils'

export const eventContractCleanerUtil = {
    cleanPayloadsAndPermissions(contract: EventContract): EventContract {
        const cleaned: EventContract = {
            eventSignatures: {},
        }

        const signatures = eventContractUtil.getNamedEventSignatures(contract)

        for (const sig of signatures) {
            const cleanedSig = {
                ...sig.signature,
            }

            const emitPayloadFields = Object.keys(
                //@ts-ignore
                cleanedSig.emitPayloadSchema?.fields?.payload?.options?.schema
                    ?.fields ?? {}
            ).length

            const targetPayloadFields = Object.keys(
                //@ts-ignore
                cleanedSig.emitPayloadSchema?.fields?.target?.options?.schema
                    ?.fields ?? {}
            ).length

            if (emitPayloadFields + targetPayloadFields === 0) {
                delete cleanedSig.emitPayloadSchema
            }

            if (
                cleanedSig.responsePayloadSchema?.fields &&
                Object.keys(cleanedSig.responsePayloadSchema?.fields).length ===
                    0
            ) {
                delete cleanedSig.responsePayloadSchema
            }

            if (
                cleanedSig.emitPermissionContract &&
                cleanedSig.emitPermissionContract.permissions.length === 0
            ) {
                delete cleanedSig.emitPermissionContract
            }

            if (
                cleanedSig.listenPermissionContract &&
                cleanedSig.listenPermissionContract.permissions.length === 0
            ) {
                delete cleanedSig.listenPermissionContract
            }

            cleaned.eventSignatures[sig.fullyQualifiedEventName] = cleanedSig
        }

        return cleaned
    },
}
