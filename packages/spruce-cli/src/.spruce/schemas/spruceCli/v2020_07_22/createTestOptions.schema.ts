import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'

const createTestOptionsSchema: SpruceSchemas.SpruceCli.v2020_07_22.CreateTestOptionsSchema =
    {
        id: 'createTestOptions',
        version: 'v2020_07_22',
        namespace: 'SpruceCli',
        name: 'Create test action',
        description: 'Your first failing test just a command away! ⚔️',
        fields: {
            /** Type of test. */
            type: {
                label: 'Type of test',
                type: 'select',
                isRequired: true,
                options: {
                    choices: [
                        { value: 'behavioral', label: 'Behavioral' },
                        { value: 'implementation', label: 'Implementation' },
                    ],
                },
            },
            /** What are you testing?. E.g. Todo Card or Systems List */
            nameReadable: {
                label: 'What are you testing?',
                type: 'text',
                isRequired: true,
                hint: 'E.g. Todo Card or Systems List',
                options: undefined,
            },
            /** Test destination directory. Where I'll save your new test. */
            testDestinationDir: {
                label: 'Test destination directory',
                type: 'text',
                hint: "Where I'll save your new test.",
                defaultValue: 'src/__tests__',
                options: undefined,
            },
            /** Camel case name. camelCase version of the name */
            nameCamel: {
                label: 'Camel case name',
                type: 'text',
                isRequired: true,
                hint: 'camelCase version of the name',
                options: undefined,
            },
            /** Pascal case name. PascalCase of the name */
            namePascal: {
                label: 'Pascal case name',
                type: 'text',
                hint: 'PascalCase of the name',
                options: undefined,
            },
        },
    }

SchemaRegistry.getInstance().trackSchema(createTestOptionsSchema)

export default createTestOptionsSchema
