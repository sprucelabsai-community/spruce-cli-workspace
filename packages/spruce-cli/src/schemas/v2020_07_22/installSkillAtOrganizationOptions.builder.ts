import { buildSchema } from '@sprucelabs/schema'

export default buildSchema({
    id: 'installSkillAtOrganizationOptions',
    name: 'install skill at organization action',
    description: 'Install your skill at any organization you are connected to.',
    fields: {
        organizationId: {
            type: 'id',
            label: 'Organization id',
        },
    },
})
