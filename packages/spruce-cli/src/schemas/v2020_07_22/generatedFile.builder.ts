import { buildSchema } from '@sprucelabs/schema'

const generatedFileBuilder = buildSchema({
    id: 'generatedFile',
    fields: {
        name: {
            type: 'text',
            isRequired: true,
        },
        path: {
            type: 'text',
            isRequired: true,
        },
        description: {
            type: 'text',
        },
        action: {
            type: 'select',
            isRequired: true,
            options: {
                choices: [
                    {
                        label: 'Skipped',
                        value: 'skipped',
                    },
                    {
                        label: 'Generated',
                        value: 'generated',
                    },
                    {
                        label: 'Updated',
                        value: 'updated',
                    },
                    {
                        label: 'Deleted',
                        value: 'deleted',
                    },
                ],
            },
        },
    },
})

export default generatedFileBuilder
