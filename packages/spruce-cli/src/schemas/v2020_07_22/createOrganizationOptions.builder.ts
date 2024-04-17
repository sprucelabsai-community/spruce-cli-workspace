import { buildSchema } from '@sprucelabs/schema'
import namedTemplateItemBuilder from './namedTemplateItem.builder'

export default buildSchema({
    id: 'createOrganizationOptions',
    name: 'create organization action',
    description:
        'Skills can only communicate with people and skills associated with the same organization. This ensures people can get differentiated experiences across multiple businesses.',
    fields: {
        nameReadable: {
            ...namedTemplateItemBuilder.fields.nameReadable,
            label: 'Name',
        },
        nameKebab: {
            ...namedTemplateItemBuilder.fields.nameKebab,
            label: 'Slug',
        },
    },
})
