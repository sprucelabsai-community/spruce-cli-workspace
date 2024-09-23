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
            hint: 'Make this something readable and memorable.',
        },
        description: {
            type: 'text',
            isRequired: true,
            label: 'How would you describe your skill?',
        },
    },
})
