import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'

const lintFailedSchema: SpruceErrors.SpruceCli.LintFailedSchema = {
    id: 'lintFailed',
    namespace: 'SpruceCli',
    name: 'Lint failed!',
    description: 'When linting a file fails',
    fields: {
        /** Pattern. The pattern used to match files relative to the root of the skill */
        pattern: {
            label: 'Pattern',
            type: 'text',
            isRequired: true,
            hint: 'The pattern used to match files relative to the root of the skill',
            options: undefined,
        },
    },
}

SchemaRegistry.getInstance().trackSchema(lintFailedSchema)

export default lintFailedSchema
