import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'

const testOptionsSchema: SpruceSchemas.SpruceCli.v2020_07_22.TestOptionsSchema =
    {
        id: 'testOptions',
        version: 'v2020_07_22',
        namespace: 'SpruceCli',
        name: 'Test skill',
        description: 'Test your might! 💪',
        fields: {
            /** Report while running. Should I output the test results while they are running? */
            shouldReportWhileRunning: {
                label: 'Report while running',
                type: 'boolean',
                hint: 'Should I output the test results while they are running?',
                defaultValue: true,
                options: undefined,
            },
            /** Pattern. I'll filter all tests that match this pattern */
            pattern: {
                label: 'Pattern',
                type: 'text',
                hint: "I'll filter all tests that match this pattern",
                options: undefined,
            },
            /** Inspect. Pass --inspect related args to test process. */
            inspect: {
                label: 'Inspect',
                type: 'number',
                hint: 'Pass --inspect related args to test process.',
                options: undefined,
            },
            /** Should wait for manual start?. */
            shouldHoldAtStart: {
                label: 'Should wait for manual start?',
                type: 'boolean',
                defaultValue: false,
                options: undefined,
            },
            /** Wait until tests are finished. For testing. Returns immediately after executing test so the running process can be managed programatically. */
            shouldReturnImmediately: {
                label: 'Wait until tests are finished',
                type: 'boolean',
                isPrivate: true,
                hint: 'For testing. Returns immediately after executing test so the running process can be managed programatically.',
                defaultValue: false,
                options: undefined,
            },
            /** Watch. */
            watchMode: {
                label: 'Watch',
                type: 'select',
                options: {
                    choices: [
                        { value: 'off', label: 'Off' },
                        { value: 'standard', label: 'Standard' },
                        { value: 'smart', label: 'Smart' },
                    ],
                },
            },
        },
    }

SchemaRegistry.getInstance().trackSchema(testOptionsSchema)

export default testOptionsSchema
