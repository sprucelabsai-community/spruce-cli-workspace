import { test, assert, generateId } from '@sprucelabs/test-utils'
import EventWriter from '../../../features/event/writers/EventWriter'
import ServiceFactory from '../../../services/ServiceFactory'
import AbstractCliTest from '../../../tests/AbstractCliTest'
import MockLintService from './MockLintService'

export default class SyncingEventsLintsOnceTest extends AbstractCliTest {
    private static writer: EventWriter
    private static destinationDir: string

    protected static async beforeEach() {
        await super.beforeEach()
        ServiceFactory.setServiceClass('lint', MockLintService)
        this.writer = this.writers.Writer('event', {
            fileDescriptions: [],
            linter: new MockLintService() as any,
        })

        this.destinationDir = this.resolvePath('/tmp', generateId())
    }

    @test()
    protected static async writingContractsLintsOnce() {
        await this.writeContracts()
        MockLintService.assertPatterns([this.destinationDir])
    }

    @test()
    protected static async lintsAfterAllFilesAreWritten() {
        const calls: string[] = []

        //@ts-ignore
        this.writer.writeContract = async () => {
            calls.push('writeContract')
            return []
        }

        //@ts-ignore
        this.writer.writeCombinedEvents = async () => {
            calls.push('writeCombinedEvents')
            return []
        }

        //@ts-ignore
        this.writer.lint = async () => {
            calls.push('lint')
        }

        await this.writeContracts()

        assert.isEqualDeep(calls, [
            'writeContract',
            'writeCombinedEvents',
            'lint',
        ])
    }

    private static async writeContracts() {
        await this.writer.writeContracts(this.destinationDir, {
            schemaTemplateItems: [],
            skillEventContractTypesFile: generateId(),
            eventBuilderFile: generateId(),
            eventContractTemplateItems: [
                {
                    eventSignatures: {},
                    id: generateId(),
                    imports: [],
                    isLocal: true,
                    nameCamel: generateId(),
                    namespace: generateId(),
                    namePascal: generateId(),
                    namespaceCamel: generateId(),
                    namespacePascal: generateId(),
                    version: 'v2020_01_01',
                },
            ],
        })
    }
}
