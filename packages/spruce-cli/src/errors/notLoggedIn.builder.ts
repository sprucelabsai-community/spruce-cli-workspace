import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
    id: 'notLoggedIn',
    name: 'Not logged in',
    description: '',
    fields: {},
})
