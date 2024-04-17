import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
    id: 'mercuryResponseError',
    name: 'Mercury response error',
    description: '',
    importsWhenLocal: [`import AbstractSpruceError from '@sprucelabs/error'`],
    fields: {
        responseErrors: {
            type: 'raw',
            isRequired: true,
            isArray: true,
            options: {
                valueType: 'AbstractSpruceError<any>',
            },
        },
    },
})
