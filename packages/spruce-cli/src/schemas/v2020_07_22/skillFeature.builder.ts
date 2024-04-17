import { buildSchema } from '@sprucelabs/schema'

export default buildSchema({
    id: 'skillFeature',
    name: 'Skill feature options',
    fields: {
        destination: {
            type: 'text',
            defaultValue: '.',
        },
        name: {
            type: 'text',
            isRequired: true,
            label: "What's the name of your skill?",
        },
        description: {
            type: 'text',
            isRequired: true,
            label: 'How would you describe your skill?',
        },
    },
})
