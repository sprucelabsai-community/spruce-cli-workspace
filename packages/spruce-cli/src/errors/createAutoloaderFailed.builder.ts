import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
    id: 'createAutoloaderFailed',
    name: 'Could not create an autoloader',
    description: 'Autoloader creation failed',
    fields: {
        globbyPattern: {
            type: 'text',
            label: 'The globby pattern used to find files',
            isRequired: true,
            hint: 'Globby pattern',
        },
        filePaths: {
            type: 'text',
            label: 'The files that were loaded',
            isArray: true,
            isRequired: true,
            hint: 'The files that were loaded',
        },
        suffix: {
            type: 'text',
            label: 'The suffix for classes to autoload',
            isRequired: true,
            hint: 'Class suffix',
        },
        directory: {
            type: 'text',
            label: "The directory we're trying to create the autoloader for",
            isRequired: true,
            hint: 'Directory to autoload',
        },
    },
})
