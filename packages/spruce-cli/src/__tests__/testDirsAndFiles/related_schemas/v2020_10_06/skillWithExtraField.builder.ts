import { buildSchema } from '@sprucelabs/schema'
import { skillSchema } from '@sprucelabs/spruce-core-schemas'

export default buildSchema({
    id: 'skillWithExtraField',
    fields: {
        ...skillSchema.fields,
        creators: {
            ...skillSchema.fields.creators,
            isPrivate: false,
        },
        extraField: {
            type: 'text',
        },
    },
})
