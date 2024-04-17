import { buildSchema } from '@sprucelabs/schema'

export default buildSchema({
    id: 'onboarding',
    name: 'Onboarding',
    description: 'Track onboarding progress and tutorials & quizzes completed.',
    fields: {
        mode: {
            type: 'select',
            label: 'mode',
            isRequired: true,
            options: {
                choices: [
                    {
                        label: 'Short',
                        value: 'short',
                    },
                    {
                        label: 'Immersive',
                        value: 'immersive',
                    },
                    {
                        label: 'Off',
                        value: 'off',
                    },
                ],
            },
        },
        stage: {
            type: 'select',
            label: 'Stage',
            options: {
                choices: [
                    {
                        label: 'Create skill',
                        value: 'create.skill',
                    },
                    {
                        label: 'Test',
                        value: 'test',
                    },
                ],
            },
        },
    },
})
