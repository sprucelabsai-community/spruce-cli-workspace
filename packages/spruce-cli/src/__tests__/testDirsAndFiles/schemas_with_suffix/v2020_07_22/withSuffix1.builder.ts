import { buildSchema } from '@sprucelabs/schema'

export default buildSchema({
    id: 'withSuffix1',
    typeSuffix: '<Type extends string = string>',
    fields: {
        related: {
            type: 'schema',
            options: {
                typeSuffix: '<Type>',
                schemaId: { id: 'withSuffix2' },
            },
        },
    },
})
