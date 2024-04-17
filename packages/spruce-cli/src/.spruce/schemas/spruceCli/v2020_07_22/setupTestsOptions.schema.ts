import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'

const setupTestsOptionsSchema: SpruceSchemas.SpruceCli.v2020_07_22.SetupTestsOptionsSchema =
    {
        id: 'setupTestsOptions',
        version: 'v2020_07_22',
        namespace: 'SpruceCli',
        name: 'Setup tests options',
        description:
            'Use this with in your CI/CD environment to get your skill ready to run tests.',
        fields: {
            /** Demo phone number. */
            demoNumber: {
                label: 'Demo phone number',
                type: 'phone',
                isRequired: true,
                options: undefined,
            },
            /** Namespace. */
            skillSlug: {
                label: 'Namespace',
                type: 'text',
                isRequired: true,
                options: undefined,
            },
        },
    }

SchemaRegistry.getInstance().trackSchema(setupTestsOptionsSchema)

export default setupTestsOptionsSchema
