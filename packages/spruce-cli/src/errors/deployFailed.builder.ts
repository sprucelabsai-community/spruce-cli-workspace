import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
    id: 'deployFailed',
    name: 'Deploy Failed',
    description: '',
    fields: {
        stage: {
            type: 'select',
            isRequired: true,
            options: {
                choices: [
                    {
                        label: 'Skill',
                        value: 'skill',
                    },
                    {
                        label: 'Building',
                        value: 'building',
                    },
                    {
                        label: 'Testing',
                        value: 'testing',
                    },
                    {
                        label: 'Git',
                        value: 'git',
                    },
                    {
                        label: 'Procfile',
                        value: 'procfile',
                    },
                    {
                        label: 'Remote',
                        value: 'remote',
                    },
                    {
                        label: 'Heroku',
                        value: 'heroku',
                    },
                ],
            },
        },
    },
})
