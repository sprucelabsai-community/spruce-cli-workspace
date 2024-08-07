import { test, assert, generateId } from '@sprucelabs/test-utils'
import SchemaWriter from '../../../features/schema/writers/SchemaWriter'
import ServiceFactory from '../../../services/ServiceFactory'
import AbstractCliTest from '../../../tests/AbstractCliTest'
import MockLintService from './MockLintService'

export default class SyncingSchemasLintsOnceTest extends AbstractCliTest {
    private static writer: SchemaWriter
    private static destinationPath: string
    private static filepath: string

    protected static async beforeEach() {
        await super.beforeEach()
        this.destinationPath = this.resolvePath('/tmp', generateId())
        this.filepath = this.destinationPath

        ServiceFactory.setServiceClass('lint', MockLintService)
        this.writer = this.writers.Writer('schema', {
            fileDescriptions: [],
            linter: new MockLintService() as any,
        })
    }

    @test.only()
    protected static async onlyLintsOnceWhenWritingLocalSchemas() {
        await this.writeSchemasAndTypes()
        MockLintService.assertPatterns([this.destinationPath])
    }

    @test()
    protected static async lintsAfterAllFilesAreWritten() {
        const calls: string[] = []

        //@ts-ignore
        this.writer.writeFileIfChangedMixinResults = async () => {
            calls.push('writeFileIfChangedMixinResults')
            return []
        }

        //@ts-ignore
        this.writer.lint = async () => {
            calls.push('lint')
        }

        await this.writeSchemasAndTypes()

        assert.isEqualDeep(calls, [
            'writeFileIfChangedMixinResults',
            'writeFileIfChangedMixinResults',
            'lint',
        ])
    }

    private static async writeSchemasAndTypes() {
        await this.writer.writeSchemasAndTypes(this.filepath, {
            fieldTemplateItems: [],
            schemaTemplateItems: [
                {
                    destinationDir: generateId(),
                    id: generateId(),
                    nameCamel: generateId(),
                    namePascal: generateId(),
                    nameReadable: generateId(),
                    namespace: generateId(),
                    schema: {
                        id: generateId(),
                        namespace: generateId(),
                        fields: {},
                    },
                },
            ],
            shouldImportCoreSchemas: false,
            valueTypes: {},
        })
    }
}
