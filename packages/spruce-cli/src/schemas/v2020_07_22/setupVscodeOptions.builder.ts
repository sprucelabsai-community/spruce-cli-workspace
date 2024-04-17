import { buildSchema } from '@sprucelabs/schema'

export default buildSchema({
    id: 'setupVscodeOptions',
    name: 'Setup vscode action',
    description:
        'Install vscode extensions, launch configs, and settings the Spruce team uses in-house!',
    fields: {
        all: {
            type: 'boolean',
            label: 'Install everything',
        },
    },
})
