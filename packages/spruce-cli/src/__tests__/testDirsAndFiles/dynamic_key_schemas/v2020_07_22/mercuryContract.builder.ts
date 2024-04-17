import { buildSchema } from '@sprucelabs/schema'

export default buildSchema({
    id: 'mercuryContract',
    name: 'Mercury Contract',
    description: '',
    dynamicFieldSignature: {
        type: 'schema',
        keyName: 'fullyQualifiedEventName',
        options: {
            schemas: [
                {
                    id: 'eventSignature',
                    name: 'Event Signature',
                    description: '',
                    fields: {
                        responsePayload: {
                            type: 'raw',
                            options: { valueType: 'SpruceSchema.Schema' },
                        },
                        emitPayload: {
                            type: 'raw',
                            options: { valueType: 'SpruceSchema.Schema' },
                        },
                        listenPermissionsAny: {
                            type: 'text',
                        },
                        emitPermissionsAny: {
                            type: 'text',
                        },
                    },
                },
                {
                    id: 'eventSignature2',
                    name: 'Event Signature2',
                    description: '',
                    fields: {
                        responsePayload: {
                            type: 'raw',
                            options: { valueType: 'SpruceSchema.Schema' },
                        },
                        emitPayload: {
                            type: 'raw',
                            options: { valueType: 'SpruceSchema.Schema' },
                        },
                        listenPermissionsAny: {
                            type: 'text',
                        },
                        emitPermissionsAny: {
                            type: 'text',
                        },
                    },
                },
            ],
        },
    },
})
