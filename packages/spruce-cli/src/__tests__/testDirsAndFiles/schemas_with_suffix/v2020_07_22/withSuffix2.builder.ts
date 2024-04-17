import { buildSchema } from '@sprucelabs/schema'

export default buildSchema({
    id: 'withSuffix2',
    typeSuffix: '<Type2 extends string = string>',
    fields: {
        typedByGeneric: {
            type: 'raw',
            options: {
                valueType: 'Type2',
            },
        },
    },
})
