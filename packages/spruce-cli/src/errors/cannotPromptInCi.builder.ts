import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
    id: 'cannotPromptInCi',
    name: 'cannot prompt in ci',
    fields: {},
})
