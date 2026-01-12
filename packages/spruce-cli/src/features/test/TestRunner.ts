import pathUtil from 'path'
import { AbstractEventEmitter } from '@sprucelabs/mercury-event-emitter'
import {
    buildEventContract,
    MercuryEventEmitter,
} from '@sprucelabs/mercury-types'
import { buildSchema } from '@sprucelabs/schema'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import SpruceError from '../../errors/SpruceError'
import CommandServiceImpl from '../../services/CommandService'
import JestJsonParser from '../../tests/JestJsonParser'
import { SpruceTestResults } from './test.types'

export default class TestRunner extends AbstractEventEmitter<TestRunnerContract> {
    private cwd: string
    private commandService: CommandServiceImpl
    private wasKilled = false
    private testResults: SpruceTestResults = { totalTestFiles: 0 }

    public constructor(options: {
        cwd: string
        commandService: CommandServiceImpl
    }) {
        super(testRunnerContract)
        this.cwd = options.cwd
        this.commandService = options.commandService
    }

    public async run(options?: {
        pattern?: string | null
        debugPort?: number | null
        isRpTraining?: boolean
    }): Promise<SpruceTestResults & { wasKilled: boolean }> {
        this.wasKilled = false

        const jestPath = this.resolvePathToJest()
        const debugArgs =
            (options?.debugPort ?? 0) > 0
                ? `--inspect=${options?.debugPort}`
                : ``
        const pattern = options?.pattern ?? ''
        let escapeShell = function (cmd: string) {
            return (
                '--testPathPatterns="' +
                cmd.replace(/(["\s'$`\\])/g, '\\$1') +
                '"'
            )
        }
        const rpReporter = options?.isRpTraining
            ? ' --reporters="@regressionproof/jest-reporter"'
            : ''
        const command = `node --experimental-vm-modules --unhandled-rejections=strict ${debugArgs} ${jestPath} --reporters="@sprucelabs/jest-json-reporter"${rpReporter} --testRunner="jest-circus/runner" --passWithNoTests ${
            pattern ? escapeShell(pattern) : ''
        }`

        const parser = new JestJsonParser()

        this.testResults = {
            totalTestFiles: 0,
        }

        try {
            await this.commandService.execute(command, {
                forceColor: true,
                onError: async (data) => {
                    const isDebugMessaging = this.isDebugMessage(data)

                    if (!isDebugMessaging) {
                        await (
                            this as MercuryEventEmitter<TestRunnerContract>
                        ).emit('did-error', { message: data })
                    }
                },
                onData: async (data) => {
                    parser.write(data)
                    this.testResults = parser.getResults()
                    await (
                        this as MercuryEventEmitter<TestRunnerContract>
                    ).emit('did-update', { results: this.testResults })
                },
            })
        } catch (err) {
            if (!this.testResults.totalTestFiles) {
                throw err
            }
        }

        return { ...this.testResults, wasKilled: this.wasKilled }
    }

    private isDebugMessage(data: string) {
        return (
            data.search(/^ attached/i) === 0 ||
            data.search(/^ listening/i) === 0 ||
            data.search(/^waiting for the /i) === 0
        )
    }

    public hasFailedTests() {
        return (this.testResults.totalFailed ?? 0) > 0
    }

    public hasSkippedTests() {
        return (this.testResults.totalSkipped ?? 0) > 0
    }

    public kill() {
        this.wasKilled = true
        this.commandService.kill()
    }

    private resolvePathToJest() {
        const jestPath = 'node_modules/.bin/jest'
        const fullPath = diskUtil.resolvePath(this.cwd)
        const pathParts = fullPath.split(pathUtil.sep)

        while (pathParts.length > 0) {
            const path =
                pathUtil.sep +
                pathUtil.join(...pathParts) +
                pathUtil.sep +
                jestPath

            if (diskUtil.doesFileExist(path)) {
                return path
            }

            pathParts.pop()
        }

        throw new SpruceError({ code: 'INVALID_TEST_DIRECTORY', dir: this.cwd })
    }
}

const testRunnerContract = buildEventContract({
    eventSignatures: {
        'did-error': {
            emitPayloadSchema: buildSchema({
                id: 'testRunnerDidErrorEmitPayload',
                fields: {
                    message: {
                        type: 'text',
                        isRequired: true,
                    },
                },
            }),
        },
        'did-update': {
            emitPayloadSchema: buildSchema({
                id: 'testRunnerDidUpdateEmitPayload',
                fields: {
                    results: {
                        type: 'raw',
                        isRequired: true,
                        options: {
                            valueType: 'SpruceTestResults',
                        },
                    },
                },
            }),
        },
    },
})
type TestRunnerContract = typeof testRunnerContract
