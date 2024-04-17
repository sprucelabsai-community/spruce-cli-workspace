import { coreEventContracts } from '@sprucelabs/mercury-core-events'
import { buildEmitTargetAndPayloadSchema } from '@sprucelabs/spruce-event-utils'
import AbstractSpruceTest, { test, assert } from '@sprucelabs/test-utils'
import { eventContractCleanerUtil } from '../../utilities/eventContractCleaner.utility'

const didMessageContract = {
    eventSignatures: {
        'did-message::v2020_12_25':
            coreEventContracts[0].eventSignatures['did-message::v2020_12_25'],
    },
}

const didMessageGlobalContractWithoutPayload = {
    eventSignatures: {
        'did-message::v2020_12_25': {
            ...coreEventContracts[0].eventSignatures[
                'did-message::v2020_12_25'
            ],
            isGlobal: true,
            emitPayloadSchema: {
                ...coreEventContracts[0].eventSignatures[
                    'did-message::v2020_12_25'
                ].emitPayloadSchema,
                fields: {},
            },
        },
    },
}

const targetOnlyPayload = {
    eventSignatures: {
        'did-message::v2020_12_25': {
            isGlobal: true,
            emitPayloadSchema: buildEmitTargetAndPayloadSchema({
                eventName: 'did-message::v2020_12_15',
                targetSchema: {
                    id: 'test',
                    fields: {
                        namespace: {
                            type: 'text',
                        },
                    },
                },
            }),
        },
    },
}

export default class EventContractCleanerUtilTest extends AbstractSpruceTest {
    @test()
    protected static async canGetEventContractCleanerUtil() {
        assert.isTruthy(eventContractCleanerUtil)
    }

    @test()
    protected static async makesNoChangeToLocalContract() {
        const cleaned =
            eventContractCleanerUtil.cleanPayloadsAndPermissions(
                didMessageContract
            )

        assert.isEqualDeep(cleaned, didMessageContract)
    }

    @test()
    protected static async stripsOutEntireEmitPayloadIfNoTargetNorPayload() {
        const cleaned = eventContractCleanerUtil.cleanPayloadsAndPermissions(
            didMessageGlobalContractWithoutPayload
        )

        assert.isFalsy(
            cleaned.eventSignatures['did-message::v2020_12_25']
                ?.emitPayloadSchema
        )
    }

    @test()
    protected static async keepsEmitPayloadIfOnlyTarget() {
        const cleaned =
            eventContractCleanerUtil.cleanPayloadsAndPermissions(
                targetOnlyPayload
            )

        assert.isTruthy(
            cleaned.eventSignatures['did-message::v2020_12_25']
                ?.emitPayloadSchema
        )
    }
}
