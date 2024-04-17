import { buildSchema, Schema, SchemaTemplateItem } from '@sprucelabs/schema'
import { CORE_NAMESPACE } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import SchemaTemplateItemBuilder from '../../templateItemBuilders/SchemaTemplateItemBuilder'
import AbstractCliTest from '../../tests/AbstractCliTest'

const cowbellV1: Schema = {
    id: 'cowbell',
    version: '2020_06_01',
    name: 'Cowbell test',
    fields: {
        radius: {
            type: 'number',
        },
    },
}

const cowbellV1TemplateItem: SchemaTemplateItem = {
    namespace: CORE_NAMESPACE,
    id: cowbellV1.id,
    importFrom: '@sprucelabs/spruce-core-schemas',
    nameCamel: 'cowbell',
    namePascal: 'Cowbell',
    nameReadable: 'Cowbell test',
    schema: { ...cowbellV1, namespace: CORE_NAMESPACE },
    isNested: false,
    destinationDir: '#spruce/schemas',
}

const cowbellV1NestedTemplateItem: SchemaTemplateItem = {
    namespace: CORE_NAMESPACE,
    id: cowbellV1.id,
    importFrom: '@sprucelabs/spruce-core-schemas',
    nameCamel: 'cowbell',
    namePascal: 'Cowbell',
    nameReadable: 'Cowbell test',
    schema: { ...cowbellV1, namespace: CORE_NAMESPACE },
    isNested: true,
    destinationDir: '#spruce/schemas',
}

const cowbellV2: Schema = {
    id: 'cowbell',
    version: '2020_06_02',
    name: 'Cowbell test two!',
    fields: {
        radius: {
            type: 'number',
        },
        owner: {
            type: 'schema',
            options: {
                schemaId: { id: 'person', version: '2020_06_03' },
            },
        },
    },
}

const cowbellV2TemplateItem: SchemaTemplateItem = {
    namespace: CORE_NAMESPACE,
    id: cowbellV2.id,
    nameCamel: 'cowbell',
    namePascal: 'Cowbell',
    nameReadable: 'Cowbell test two!',
    isNested: false,
    destinationDir: '#spruce/schemas',
    importFrom: '@sprucelabs/spruce-core-schemas',
    schema: {
        id: 'cowbell',
        version: '2020_06_02',
        name: 'Cowbell test two!',
        namespace: CORE_NAMESPACE,
        fields: {
            radius: {
                type: 'number',
            },
            owner: {
                type: 'schema',
                options: {
                    schemaIds: [
                        {
                            id: 'person',
                            version: '2020_06_03',
                            namespace: CORE_NAMESPACE,
                        },
                    ],
                },
            },
        },
    },
}

const cowbellV2NestedTemplateItem: SchemaTemplateItem = {
    namespace: CORE_NAMESPACE,
    id: cowbellV2.id,
    nameCamel: 'cowbell',
    namePascal: 'Cowbell',
    nameReadable: 'Cowbell test two!',
    isNested: true,
    destinationDir: '#spruce/schemas',
    importFrom: '@sprucelabs/spruce-core-schemas',
    schema: {
        id: 'cowbell',
        version: '2020_06_02',
        name: 'Cowbell test two!',
        namespace: CORE_NAMESPACE,
        fields: {
            radius: {
                type: 'number',
            },
            owner: {
                type: 'schema',
                options: {
                    schemaIds: [
                        {
                            id: 'person',
                            version: '2020_06_03',
                            namespace: CORE_NAMESPACE,
                        },
                    ],
                },
            },
        },
    },
}

const personV1: Schema = {
    id: 'person',
    version: '2020_06_01',
    name: 'Person test',
    fields: {
        name: {
            type: 'text',
        },
    },
}

const personV1TemplateItem: SchemaTemplateItem = {
    namespace: CORE_NAMESPACE,
    importFrom: '@sprucelabs/spruce-core-schemas',
    id: personV1.id,
    nameCamel: 'person',
    namePascal: 'Person',
    nameReadable: 'Person test',
    schema: { ...personV1, namespace: CORE_NAMESPACE },
    isNested: false,
    destinationDir: '#spruce/schemas',
}

const personV2: Schema = {
    id: 'person',
    version: '2020_06_01',
    name: 'Person version 2',
    fields: {
        name: {
            type: 'text',
        },
        favoriteVehicle: {
            type: 'schema',
            options: {
                schema: {
                    id: 'vehicle',
                    name: 'Vehicle v1',
                    version: '2020_06_01',
                    fields: {
                        make: {
                            type: 'text',
                        },
                    },
                },
            },
        },
    },
}

const personV2TemplateItem: SchemaTemplateItem = {
    namespace: CORE_NAMESPACE,
    id: personV1.id,
    importFrom: '@sprucelabs/spruce-core-schemas',
    nameCamel: 'person',
    namePascal: 'Person',
    nameReadable: 'Person version 2',
    isNested: false,
    destinationDir: '#spruce/schemas',
    schema: {
        id: 'person',
        version: '2020_06_01',
        name: 'Person version 2',
        namespace: CORE_NAMESPACE,
        fields: {
            name: {
                type: 'text',
            },
            favoriteVehicle: {
                type: 'schema',
                options: {
                    schemaIds: [
                        {
                            id: 'vehicle',
                            version: '2020_06_01',
                            namespace: CORE_NAMESPACE,
                        },
                    ],
                },
            },
        },
    },
}

const personV3: Schema = {
    id: 'person',
    version: '2020_06_03',
    name: 'Person test the 3rd',
    fields: {
        relatedField: {
            type: 'schema',
            options: {
                schemas: [cowbellV1, cowbellV2],
            },
        },
    },
}

const personV3TemplateItem: SchemaTemplateItem = {
    namespace: CORE_NAMESPACE,
    importFrom: '@sprucelabs/spruce-core-schemas',
    id: personV3.id,
    nameCamel: 'person',
    namePascal: 'Person',
    nameReadable: 'Person test the 3rd',
    isNested: false,
    destinationDir: '#spruce/schemas',
    schema: {
        id: 'person',
        version: '2020_06_03',
        name: 'Person test the 3rd',
        namespace: CORE_NAMESPACE,
        fields: {
            relatedField: {
                type: 'schema',
                options: {
                    schemaIds: [
                        {
                            id: 'cowbell',
                            version: '2020_06_01',
                            namespace: CORE_NAMESPACE,
                        },
                        {
                            id: 'cowbell',
                            version: '2020_06_02',
                            namespace: CORE_NAMESPACE,
                        },
                    ],
                },
            },
        },
    },
}

const vehicleV1TemplateItem: SchemaTemplateItem = {
    namespace: CORE_NAMESPACE,
    importFrom: '@sprucelabs/spruce-core-schemas',
    id: 'vehicle',
    nameCamel: 'vehicle',
    namePascal: 'Vehicle',
    nameReadable: 'Vehicle v1',
    isNested: true,
    destinationDir: '#spruce/schemas',
    schema: {
        id: 'vehicle',
        name: 'Vehicle v1',
        namespace: CORE_NAMESPACE,
        version: '2020_06_01',
        fields: {
            make: {
                type: 'text',
            },
        },
    },
}

const personV4: Schema = {
    id: 'person',
    version: '2020_06_04',
    name: 'Person test the last',
    importsWhenLocal: ["import BaseParent from '../../file'"],
    importsWhenRemote: [
        "import BaseParent from '@sprucelabs/spruce-core-schemas'",
    ],
    fields: {
        cowbells: {
            type: 'schema',
            options: {
                schemaIds: [
                    { id: 'cowbell', version: '2020_06_01' },
                    { id: 'cowbell', version: '2020_06_02' },
                ],
            },
        },
    },
}

const personV4TemplateItem: SchemaTemplateItem = {
    namespace: CORE_NAMESPACE,
    importFrom: '@sprucelabs/spruce-core-schemas',
    id: personV4.id,
    nameCamel: 'person',
    namePascal: 'Person',
    nameReadable: 'Person test the last',
    schema: {
        id: 'person',
        version: '2020_06_04',
        name: 'Person test the last',
        namespace: CORE_NAMESPACE,
        importsWhenLocal: ["import BaseParent from '../../file'"],
        importsWhenRemote: [
            "import BaseParent from '@sprucelabs/spruce-core-schemas'",
        ],
        fields: {
            cowbells: {
                type: 'schema',
                options: {
                    schemaIds: [
                        {
                            id: 'cowbell',
                            version: '2020_06_01',
                            namespace: CORE_NAMESPACE,
                        },
                        {
                            id: 'cowbell',
                            version: '2020_06_02',
                            namespace: CORE_NAMESPACE,
                        },
                    ],
                },
            },
        },
    },
    isNested: false,
    imports: ["import BaseParent from '@sprucelabs/spruce-core-schemas'"],
    destinationDir: '#spruce/schemas',
}

const nestedMercuryContract: Schema = {
    id: 'mercuryContract',
    name: 'Mercury Contract',
    description: '',
    version: '2020_09_01',
    dynamicFieldSignature: {
        type: 'schema',
        keyName: 'fullyQualifiedEventName',
        options: {
            schema: {
                id: 'eventSignature',
                name: 'Event Signature',
                description: '',
                fields: {
                    responsePayload: {
                        type: 'raw',
                        options: { valueType: 'Schema' },
                    },
                    emitPayload: {
                        type: 'raw',
                        options: { valueType: 'Schema' },
                    },
                    listenPermissionsAny: {
                        type: 'text',
                    },
                    emitPermissionsAny: {
                        type: 'text',
                    },
                },
            },
        },
    },
}

const nestedMercuryContractArray: Schema = {
    id: 'mercuryContract',
    name: 'Mercury Contract',
    description: '',
    version: '2020_09_01',

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
                            options: { valueType: 'Schema' },
                        },
                        emitPayload: {
                            type: 'raw',
                            options: { valueType: 'Schema' },
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
                            options: { valueType: 'Schema' },
                        },
                        emitPayload: {
                            type: 'raw',
                            options: { valueType: 'Schema' },
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
}

const mercuryTemplateItem: SchemaTemplateItem = {
    namespace: CORE_NAMESPACE,
    importFrom: '@sprucelabs/spruce-core-schemas',
    id: nestedMercuryContract.id,
    nameCamel: 'mercuryContract',
    namePascal: 'MercuryContract',
    nameReadable: nestedMercuryContract.name ?? nestedMercuryContract.id,
    isNested: false,
    destinationDir: '#spruce/schemas',
    schema: {
        id: 'mercuryContract',
        name: 'Mercury Contract',
        description: '',
        namespace: CORE_NAMESPACE,
        version: '2020_09_01',
        dynamicFieldSignature: {
            type: 'schema',
            keyName: 'fullyQualifiedEventName',
            options: {
                schemaIds: [
                    {
                        id: 'eventSignature',
                        version: '2020_09_01',
                        namespace: CORE_NAMESPACE,
                    },
                ],
            },
        },
    },
}

const eventSignatureTemplateItem: SchemaTemplateItem = {
    namespace: CORE_NAMESPACE,
    id: 'eventSignature',
    importFrom: '@sprucelabs/spruce-core-schemas',
    nameCamel: 'eventSignature',
    namePascal: 'EventSignature',
    nameReadable: 'Event Signature',
    isNested: true,
    destinationDir: '#spruce/schemas',
    schema: {
        id: 'eventSignature',
        name: 'Event Signature',
        description: '',
        version: '2020_09_01',
        namespace: CORE_NAMESPACE,
        fields: {
            responsePayload: {
                type: 'raw',
                options: { valueType: 'Schema' },
            },
            emitPayload: {
                type: 'raw',
                options: { valueType: 'Schema' },
            },
            listenPermissionsAny: {
                type: 'text',
            },
            emitPermissionsAny: {
                type: 'text',
            },
        },
    },
}
const mercuryTemplateItemArray: SchemaTemplateItem = {
    namespace: CORE_NAMESPACE,
    id: nestedMercuryContractArray.id,
    importFrom: '@sprucelabs/spruce-core-schemas',
    nameCamel: 'mercuryContract',
    namePascal: 'MercuryContract',
    nameReadable:
        nestedMercuryContractArray.name ?? nestedMercuryContractArray.id,
    isNested: false,
    destinationDir: '#spruce/schemas',
    schema: {
        id: 'mercuryContract',
        name: 'Mercury Contract',
        description: '',
        version: '2020_09_01',
        namespace: CORE_NAMESPACE,
        dynamicFieldSignature: {
            type: 'schema',
            keyName: 'fullyQualifiedEventName',
            options: {
                schemaIds: [
                    {
                        id: 'eventSignature',
                        version: '2020_09_01',
                        namespace: CORE_NAMESPACE,
                    },
                    {
                        id: 'eventSignature2',
                        version: '2020_09_01',
                        namespace: CORE_NAMESPACE,
                    },
                ],
            },
        },
    },
}

const eventSignatureTemplateItem2: SchemaTemplateItem = {
    namespace: CORE_NAMESPACE,
    id: 'eventSignature2',
    nameCamel: 'eventSignature2',
    importFrom: '@sprucelabs/spruce-core-schemas',
    namePascal: 'EventSignature2',
    nameReadable: 'Event Signature2',
    isNested: true,
    destinationDir: '#spruce/schemas',
    schema: {
        id: 'eventSignature2',
        name: 'Event Signature2',
        description: '',
        version: '2020_09_01',
        namespace: CORE_NAMESPACE,
        fields: {
            responsePayload: {
                type: 'raw',
                options: { valueType: 'Schema' },
            },
            emitPayload: {
                type: 'raw',
                options: { valueType: 'Schema' },
            },
            listenPermissionsAny: {
                type: 'text',
            },
            emitPermissionsAny: {
                type: 'text',
            },
        },
    },
}

const schemaWithManyNestedSchemas: Schema = {
    id: 'manyNested',
    version: '2020_09_01',
    fields: {
        firstLayer: {
            type: 'schema',
            options: {
                schema: {
                    id: 'firstLayer',
                    fields: {
                        secondLayer: {
                            type: 'schema',
                            options: {
                                schema: {
                                    id: 'secondLayer',
                                    namespace: 'OutsideNamespace',
                                    fields: {
                                        lastLayer: {
                                            type: 'schema',
                                            options: {
                                                schema: {
                                                    id: 'lastLayer',
                                                    fields: {
                                                        pass: {
                                                            type: 'boolean',
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
}

const manyNestedTemplateItem: SchemaTemplateItem = {
    id: 'manyNested',
    namespace: CORE_NAMESPACE,
    importFrom: '@sprucelabs/spruce-core-schemas',
    schema: {
        id: 'manyNested',
        version: '2020_09_01',
        namespace: CORE_NAMESPACE,
        fields: {
            firstLayer: {
                type: 'schema',
                options: {
                    schemaIds: [
                        {
                            id: 'firstLayer',
                            version: '2020_09_01',
                            namespace: CORE_NAMESPACE,
                        },
                    ],
                },
            },
        },
    },
    nameReadable: 'manyNested',
    nameCamel: 'manyNested',
    namePascal: 'ManyNested',
    isNested: false,
    destinationDir: '#spruce/schemas',
}

const firstLayerTemplateItem: SchemaTemplateItem = {
    id: 'firstLayer',
    namespace: CORE_NAMESPACE,
    importFrom: '@sprucelabs/spruce-core-schemas',
    schema: {
        id: 'firstLayer',
        version: '2020_09_01',
        namespace: CORE_NAMESPACE,
        fields: {
            secondLayer: {
                type: 'schema',
                options: {
                    schemaIds: [
                        {
                            id: 'secondLayer',
                            namespace: 'OutsideNamespace',
                            version: '2020_09_01',
                        },
                    ],
                },
            },
        },
    },
    nameReadable: 'firstLayer',
    nameCamel: 'firstLayer',
    namePascal: 'FirstLayer',
    isNested: true,
    destinationDir: '#spruce/schemas',
}

const secondLayerTemplateItem: SchemaTemplateItem = {
    id: 'secondLayer',
    namespace: 'OutsideNamespace',
    schema: {
        id: 'secondLayer',
        version: '2020_09_01',
        namespace: 'OutsideNamespace',
        fields: {
            lastLayer: {
                type: 'schema',
                options: {
                    schemaIds: [
                        {
                            id: 'lastLayer',
                            version: '2020_09_01',
                            namespace: 'OutsideNamespace',
                        },
                    ],
                },
            },
        },
    },
    nameReadable: 'secondLayer',
    nameCamel: 'secondLayer',
    namePascal: 'SecondLayer',
    isNested: true,
    destinationDir: '#spruce/schemas',
}

const lastLayerTemplateItem: SchemaTemplateItem = {
    id: 'lastLayer',
    namespace: 'OutsideNamespace',
    schema: {
        id: 'lastLayer',
        namespace: 'OutsideNamespace',
        version: '2020_09_01',
        fields: { pass: { type: 'boolean' } },
    },
    nameReadable: 'lastLayer',
    nameCamel: 'lastLayer',
    namePascal: 'LastLayer',
    isNested: true,
    destinationDir: '#spruce/schemas',
}

const mercurySchemas = [
    {
        id: 'mercuryContract',
        name: 'Mercury Contract',
        description: '',
        fields: {
            eventSignatures: {
                type: 'schema',
                isRequired: true,
                isArray: true,
                options: {
                    schema: {
                        id: 'eventSignature',
                        name: 'Event Signature',
                        description: '',
                        fields: {
                            fullyQualifiedEventName: {
                                type: 'text',
                                isRequired: true,
                            },
                            responsePayload: {
                                type: 'raw',
                                options: { valueType: 'SpruceSchema.Schema' },
                            },
                            emitPayload: {
                                type: 'raw',
                                options: { valueType: 'SpruceSchema.Schema' },
                            },
                            listenPermissions: {
                                type: 'schema',
                                isArray: true,
                                options: {
                                    schemaId: {
                                        id: 'permission',
                                        version: 'v2020_09_01',
                                    },
                                },
                            },
                            emitPermissions: {
                                type: 'schema',
                                isArray: true,
                                options: {
                                    schemaId: {
                                        id: 'permission',
                                        version: 'v2020_09_01',
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        version: 'v2020_09_01',
    },
    {
        id: 'permissionContract',
        name: 'Permission Contract',
        description: '',
        fields: {
            requireAllPermissions: { type: 'boolean', defaultValue: false },
            permissions: {
                type: 'schema',
                isRequired: true,
                isArray: true,
                options: {
                    schema: {
                        id: 'permission',
                        name: 'Permission',
                        fields: {
                            name: {
                                type: 'text',
                                label: 'Permission name',
                                isRequired: true,
                                hint: 'Hyphen separated name for this permission, e.g. can-unlock-doors',
                            },
                            requireAllStatuses: {
                                type: 'boolean',
                                label: 'Require all statuses',
                                defaultValue: false,
                            },
                            defaults: {
                                type: 'schema',
                                options: {
                                    schema: {
                                        id: 'defaultsByRole',
                                        fields: {
                                            owner: { type: 'boolean' },
                                            groupManager: { type: 'boolean' },
                                            manager: { type: 'boolean' },
                                            teammate: { type: 'boolean' },
                                            guest: { type: 'boolean' },
                                        },
                                    },
                                },
                            },
                            can: {
                                type: 'schema',
                                options: {
                                    schema: {
                                        id: 'statusFlags',
                                        fields: {
                                            default: { type: 'boolean' },
                                            clockedIn: {
                                                label: 'Clocked in',
                                                hint: 'Is the person clocked in and ready to rock?',
                                                type: 'boolean',
                                            },
                                            clockedOut: {
                                                label: 'Clocked out',
                                                hint: 'When someone is not working (off the clock).',
                                                type: 'boolean',
                                            },
                                            onPrem: {
                                                label: 'On premise',
                                                hint: 'Are they at work (maybe working, maybe visiting).',
                                                type: 'boolean',
                                            },
                                            offPrem: {
                                                label: 'Off premise',
                                                hint: "They aren't at the office or shop.",
                                                type: 'boolean',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        version: 'v2020_09_01',
    },
]

const mercuryTemplateItems = [
    {
        id: 'statusFlags',
        importFrom: '@sprucelabs/spruce-core-schemas',
        namespace: CORE_NAMESPACE,
        schema: {
            version: 'v2020_09_01',
            id: 'statusFlags',
            namespace: CORE_NAMESPACE,
            fields: {
                default: { type: 'boolean' },
                clockedIn: {
                    label: 'Clocked in',
                    hint: 'Is the person clocked in and ready to rock?',
                    type: 'boolean',
                },
                clockedOut: {
                    label: 'Clocked out',
                    hint: 'When someone is not working (off the clock).',
                    type: 'boolean',
                },
                onPrem: {
                    label: 'On premise',
                    hint: 'Are they at work (maybe working, maybe visiting).',
                    type: 'boolean',
                },
                offPrem: {
                    label: 'Off premise',
                    hint: "They aren't at the office or shop.",
                    type: 'boolean',
                },
            },
        },
        nameReadable: 'statusFlags',
        nameCamel: 'statusFlags',
        namePascal: 'StatusFlags',
        isNested: true,
        destinationDir: '#spruce/schemas',
    },
    {
        id: 'defaultsByRole',
        importFrom: '@sprucelabs/spruce-core-schemas',
        namespace: CORE_NAMESPACE,
        schema: {
            version: 'v2020_09_01',
            id: 'defaultsByRole',
            namespace: CORE_NAMESPACE,
            fields: {
                owner: { type: 'boolean' },
                groupManager: { type: 'boolean' },
                manager: { type: 'boolean' },
                teammate: { type: 'boolean' },
                guest: { type: 'boolean' },
            },
        },
        nameReadable: 'defaultsByRole',
        nameCamel: 'defaultsByRole',
        namePascal: 'DefaultsByRole',
        isNested: true,
        destinationDir: '#spruce/schemas',
    },
    {
        id: 'permission',
        namespace: CORE_NAMESPACE,
        importFrom: '@sprucelabs/spruce-core-schemas',
        schema: {
            version: 'v2020_09_01',
            id: 'permission',
            namespace: CORE_NAMESPACE,
            fields: {
                name: {
                    type: 'text',
                    label: 'Permission name',
                    isRequired: true,
                    hint: 'Hyphen separated name for this permission, e.g. can-unlock-doors',
                },
                requireAllStatuses: {
                    type: 'boolean',
                    label: 'Require all statuses',
                    defaultValue: false,
                },
                defaults: {
                    type: 'schema',
                    options: {
                        schemaIds: [
                            {
                                id: 'defaultsByRole',
                                version: 'v2020_09_01',
                                namespace: CORE_NAMESPACE,
                            },
                        ],
                    },
                },
                can: {
                    type: 'schema',
                    options: {
                        schemaIds: [
                            {
                                id: 'statusFlags',
                                version: 'v2020_09_01',
                                namespace: CORE_NAMESPACE,
                            },
                        ],
                    },
                },
            },
            name: 'Permission',
        },
        nameReadable: 'Permission',
        nameCamel: 'permission',
        namePascal: 'Permission',
        isNested: true,
        destinationDir: '#spruce/schemas',
    },
    {
        id: 'permissionContract',
        namespace: CORE_NAMESPACE,
        importFrom: '@sprucelabs/spruce-core-schemas',
        schema: {
            id: 'permissionContract',
            name: 'Permission Contract',
            namespace: CORE_NAMESPACE,
            description: '',
            fields: {
                requireAllPermissions: { type: 'boolean', defaultValue: false },
                permissions: {
                    type: 'schema',
                    isRequired: true,
                    isArray: true,
                    options: {
                        schemaIds: [
                            {
                                id: 'permission',
                                version: 'v2020_09_01',
                                namespace: CORE_NAMESPACE,
                            },
                        ],
                    },
                },
            },
            version: 'v2020_09_01',
        },
        nameReadable: 'Permission Contract',
        nameCamel: 'permissionContract',
        namePascal: 'PermissionContract',
        isNested: false,
        destinationDir: '#spruce/schemas',
    },
    {
        id: 'eventSignature',
        namespace: CORE_NAMESPACE,
        importFrom: '@sprucelabs/spruce-core-schemas',
        schema: {
            version: 'v2020_09_01',
            id: 'eventSignature',
            name: 'Event Signature',
            namespace: CORE_NAMESPACE,
            description: '',
            fields: {
                fullyQualifiedEventName: { type: 'text', isRequired: true },
                responsePayload: {
                    type: 'raw',
                    options: { valueType: 'SpruceSchema.Schema' },
                },
                emitPayload: {
                    type: 'raw',
                    options: { valueType: 'SpruceSchema.Schema' },
                },
                listenPermissions: {
                    type: 'schema',
                    isArray: true,
                    options: {
                        schemaIds: [
                            {
                                version: 'v2020_09_01',
                                id: 'permission',
                                namespace: CORE_NAMESPACE,
                            },
                        ],
                    },
                },
                emitPermissions: {
                    type: 'schema',
                    isArray: true,
                    options: {
                        schemaIds: [
                            {
                                version: 'v2020_09_01',
                                id: 'permission',
                                namespace: CORE_NAMESPACE,
                            },
                        ],
                    },
                },
            },
        },
        nameReadable: 'Event Signature',
        nameCamel: 'eventSignature',
        namePascal: 'EventSignature',
        isNested: true,
        destinationDir: '#spruce/schemas',
    },
    {
        id: 'mercuryContract',
        namespace: CORE_NAMESPACE,
        importFrom: '@sprucelabs/spruce-core-schemas',
        schema: {
            id: 'mercuryContract',
            name: 'Mercury Contract',
            namespace: CORE_NAMESPACE,
            description: '',
            fields: {
                eventSignatures: {
                    type: 'schema',
                    isRequired: true,
                    isArray: true,
                    options: {
                        schemaIds: [
                            {
                                id: 'eventSignature',
                                version: 'v2020_09_01',
                                namespace: CORE_NAMESPACE,
                            },
                        ],
                    },
                },
            },
            version: 'v2020_09_01',
        },
        nameReadable: 'Mercury Contract',
        nameCamel: 'mercuryContract',
        namePascal: 'MercuryContract',
        isNested: false,
        destinationDir: '#spruce/schemas',
    },
]

const localSchema = buildSchema({
    id: 'localNamespaceSchema',
    namespace: 'Mercury',
    fields: {
        onlyField: {
            type: 'text',
        },
    },
})

const localSchemaTemplateItem: SchemaTemplateItem = {
    namespace: 'Mercury',
    id: 'localNamespaceSchema',
    nameCamel: 'localNamespaceSchema',
    namePascal: 'LocalNamespaceSchema',
    nameReadable: 'localNamespaceSchema',
    isNested: false,
    destinationDir: '#spruce/schemas',
    schema: localSchema,
}

export default class SchemaTemplateItemBuilderTest extends AbstractCliTest {
    private static itemBuilder: SchemaTemplateItemBuilder

    private static readonly LOCAL_NAMESPACE = 'LocalNamespace'

    protected static async beforeEach() {
        await super.beforeEach()
        this.itemBuilder = new SchemaTemplateItemBuilder(this.LOCAL_NAMESPACE)
    }

    @test()
    protected static canInstantiate() {
        assert.isTruthy(this.itemBuilder)
    }

    @test()
    protected static hasGenerateFunction() {
        assert.isFunction(this.itemBuilder.buildTemplateItems)
    }

    @test()
    protected static turnsSingleDefinitionIntoTemplateItem() {
        const results = this.itemBuilder.buildTemplateItems(
            { [CORE_NAMESPACE]: [personV1] },
            '#spruce/schemas'
        )
        const actual = results[0]

        assert.isEqualDeep(actual, personV1TemplateItem)
    }

    @test(
        'turns 2 definitions into 2 template items',
        [cowbellV1, personV1],
        [personV1TemplateItem, cowbellV1TemplateItem]
    )
    @test(
        'turns one nested definition into 2 items',
        [personV2],
        [vehicleV1TemplateItem, personV2TemplateItem]
    )
    @test(
        'handles recursion without looping forever',
        [personV3],
        [
            cowbellV1NestedTemplateItem,
            personV3TemplateItem,
            cowbellV2NestedTemplateItem,
        ]
    )
    @test(
        'handles duplication',
        [cowbellV1, cowbellV1, cowbellV1],
        [cowbellV1TemplateItem]
    )
    @test(
        'handles resolving by id and version',
        [personV4, personV3, cowbellV1, cowbellV2],
        [
            cowbellV2TemplateItem,
            cowbellV1TemplateItem,
            personV3TemplateItem,
            personV4TemplateItem,
        ]
    )
    @test(
        'handles resolving by id and version in different order',
        [cowbellV1, personV4, personV3, cowbellV2],
        [
            cowbellV2TemplateItem,
            cowbellV1TemplateItem,
            personV3TemplateItem,
            personV4TemplateItem,
        ]
    )
    @test(
        'handles nested schema in dynamic key signature',
        [nestedMercuryContract],
        [eventSignatureTemplateItem, mercuryTemplateItem]
    )
    @test(
        'handles nested schemas in dynamic key signature',
        [nestedMercuryContractArray],
        [
            eventSignatureTemplateItem2,
            eventSignatureTemplateItem,
            mercuryTemplateItemArray,
        ]
    )
    @test(
        'handles many layers of nested schemas',
        [schemaWithManyNestedSchemas],
        [
            lastLayerTemplateItem,
            secondLayerTemplateItem,
            firstLayerTemplateItem,
            manyNestedTemplateItem,
        ]
    )
    @test('can import event contracts', mercurySchemas, mercuryTemplateItems)
    @test(
        'import from not set if matching local namespace',
        [localSchema],
        [localSchemaTemplateItem],
        'Mercury'
    )
    protected static generationTests(
        schemas: Schema[],
        expected: SchemaTemplateItem[],
        localNamespace = this.LOCAL_NAMESPACE
    ) {
        this.itemBuilder = new SchemaTemplateItemBuilder(localNamespace)

        const results = this.itemBuilder.buildTemplateItems({
            [CORE_NAMESPACE]: schemas,
        })

        assert.isLength(results, expected.length)

        expected.forEach((expected, idx) => {
            const match = results[idx]
            assert.isTruthy(
                match,
                `Did not find a template item for ${expected.id}`
            )
            assert.isEqualDeep(match, expected)
        })
    }

    @test()
    protected static setsImports() {
        const results = this.itemBuilder.buildTemplateItems(
            {
                [this.LOCAL_NAMESPACE]: [
                    buildSchema({
                        id: 'local',
                        importsWhenLocal: ['import local from "local"'],
                        importsWhenRemote: ['import remote from "remote"'],
                        fields: {
                            firstName: { type: 'text' },
                        },
                    }),
                ],
            },
            '#spruce/schemas'
        )

        assert.isEqualDeep(results, [
            {
                id: 'local',
                namespace: 'LocalNamespace',
                schema: {
                    //@ts-ignore
                    id: 'local',
                    namespace: 'LocalNamespace',
                    importsWhenLocal: [`import local from "local"`],
                    importsWhenRemote: [`import remote from "remote"`],
                    fields: {
                        firstName: {
                            type: 'text',
                        },
                    },
                },
                nameReadable: 'local',
                nameCamel: 'local',
                namePascal: 'Local',
                isNested: false,
                destinationDir: '#spruce/schemas',
                imports: [`import local from "local"`],
            },
        ])
    }

    @test()
    protected static bringsImportsFromRemoteFromRelatedSchemas() {
        const results = this.itemBuilder.buildTemplateItems(
            {
                [this.LOCAL_NAMESPACE]: [
                    buildSchema({
                        id: 'local',
                        importsWhenLocal: ['import local from "local"'],
                        importsWhenRemote: ['import remote from "remote"'],
                        fields: {
                            firstName: { type: 'text' },
                            remote: {
                                type: 'schema',
                                options: {
                                    schema: {
                                        id: 'remote',
                                        namespace: 'AnotherNamespace',
                                    },
                                },
                            },
                            local: {
                                type: 'schema',
                                options: {
                                    schema: {
                                        id: 'local',
                                        namespace: this.LOCAL_NAMESPACE,
                                    },
                                },
                            },
                        },
                    }),
                    buildSchema({
                        id: 'local2',
                        importsWhenLocal: ['import local2 from "local2"'],
                        importsWhenRemote: ['import remote2 from "remote2"'],
                        fields: {
                            firstName: { type: 'text' },
                            remote: {
                                type: 'schema',
                                options: {
                                    schema: {
                                        id: 'remote',
                                        namespace: 'AnotherNamespace',
                                    },
                                },
                            },
                        },
                    }),
                ],
                AnotherNamespace: [
                    buildSchema({
                        id: 'remote',
                        importsWhenLocal: ['import local2 from "local2"'],
                        importsWhenRemote: ['import remote3 from "remote3"'],
                        fields: {
                            firstName: { type: 'text' },
                        },
                    }),
                ],
            },
            '#spruce/schemas'
        )

        assert.isEqualDeep(results, [
            {
                id: 'remote',
                namespace: 'AnotherNamespace',
                schema: {
                    id: 'remote',
                    namespace: 'AnotherNamespace',
                    importsWhenLocal: ['import local2 from "local2"'],
                    importsWhenRemote: ['import remote3 from "remote3"'],
                    fields: { firstName: { type: 'text' } },
                },
                nameReadable: 'remote',
                nameCamel: 'remote',
                namePascal: 'Remote',
                isNested: false,
                destinationDir: '#spruce/schemas',
                imports: ['import remote3 from "remote3"'],
            },
            {
                id: 'local2',
                namespace: 'LocalNamespace',
                schema: {
                    namespace: 'LocalNamespace',
                    id: 'local2',
                    importsWhenLocal: ['import local2 from "local2"'],
                    importsWhenRemote: ['import remote2 from "remote2"'],
                    fields: {
                        firstName: { type: 'text' },
                        remote: {
                            type: 'schema',
                            options: {
                                schemaIds: [
                                    {
                                        id: 'remote',
                                        namespace: 'AnotherNamespace',
                                    },
                                ],
                            },
                        },
                    },
                },
                nameReadable: 'local2',
                nameCamel: 'local2',
                namePascal: 'Local2',
                isNested: false,
                destinationDir: '#spruce/schemas',
                imports: [
                    'import local2 from "local2"',
                    'import remote3 from "remote3"',
                ],
            },
            {
                id: 'local',
                namespace: 'LocalNamespace',
                schema: {
                    id: 'local',
                    namespace: 'LocalNamespace',
                    importsWhenLocal: ['import local from "local"'],
                    importsWhenRemote: ['import remote from "remote"'],
                    fields: {
                        firstName: { type: 'text' },
                        remote: {
                            type: 'schema',
                            options: {
                                schemaIds: [
                                    {
                                        id: 'remote',
                                        namespace: 'AnotherNamespace',
                                    },
                                ],
                            },
                        },
                        local: {
                            type: 'schema',
                            options: {
                                schemaIds: [
                                    {
                                        id: 'local',
                                        namespace: 'LocalNamespace',
                                    },
                                ],
                            },
                        },
                    },
                },
                nameReadable: 'local',
                nameCamel: 'local',
                namePascal: 'Local',
                isNested: false,
                destinationDir: '#spruce/schemas',
                imports: [
                    'import local from "local"',
                    'import remote3 from "remote3"',
                ],
            },
        ])
    }
}
