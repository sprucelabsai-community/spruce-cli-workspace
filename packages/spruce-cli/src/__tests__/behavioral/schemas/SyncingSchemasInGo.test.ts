import globby from '@sprucelabs/globby'
import { Schema, SchemaTypesRenderer } from '@sprucelabs/schema'
import {
    diskUtil,
    namesUtil,
    versionUtil,
} from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import CommandServiceImpl from '../../../services/CommandService'
import AbstractSkillTest from '../../../tests/AbstractSkillTest'
import testUtil from '../../../tests/utilities/test.utility'

export default class SyncingSchemasInGoTest extends AbstractSkillTest {
    protected static skillCacheKey = 'schemas'
    private static goDir: string
    private static builder1Name = 'aSchemaIBuilt'
    private static builder2Name = 'anotherSchemaIBuilt'
    private static renderer: SchemaTypesRenderer

    private static readonly version = versionUtil.generateVersion().constValue

    protected static async beforeEach(): Promise<void> {
        await super.beforeEach()

        if (!this.goDir) {
            this.goDir = this.resolvePath(this.skillDir, 'go-schemas')
            diskUtil.createDir(this.goDir)
        }

        CommandServiceImpl.fakeCommand(/yarn.*?/, {
            code: 1,
        })

        this.renderer = SchemaTypesRenderer.Renderer()
    }

    @test()
    protected static async canSyncCoreSchemasWithoutError() {
        this.moveToGoDir()

        await this.go.initGoProject()
        await this.sync()

        const tsFiles = await globby('**/*.ts', {
            cwd: this.cwd,
        })
        assert.isLength(tsFiles, 0, 'Expected no .ts files to be generated.')
    }

    @test()
    protected static async syncingGeneratesCoreGoFileIfSchemaDoesExist() {
        await this.createSchema(this.builder1Name)

        this.moveToGoDir()

        const syncResults = await this.sync()
        testUtil.assertFileByPathInGeneratedFiles(
            this.coreSchemaGoFilepath,
            syncResults.files
        )

        assert.isTrue(
            diskUtil.doesFileExist(this.coreSchemaGoFilepath),
            'Expected core_schemas.go file to exist.'
        )
    }

    @test()
    protected static async coreSchemasFileHasStructBasedOnSchema() {
        await this.assertCoreFileIncludesSchema(this.builder1Name)
    }

    @test()
    protected static async coreShowsDifferentSchema() {
        await this.createSchema(this.builder2Name)
        this.moveToGoDir()
        await this.sync()
        await this.assertCoreFileIncludesSchema(this.builder2Name)
    }

    @test()
    protected static async doesNotIncludeSchemaIfDeleted() {
        diskUtil.deleteFile(this.getBuilderFilepath(this.builder1Name))

        this.moveToGoDir()
        await this.sync()

        const contents = this.loadCoreSchemasFile()
        assert.doesNotInclude(
            contents,
            namesUtil.toPascal(this.builder1Name),
            'Expected core_schemas.go to not include deleted schema.'
        )
    }

    @test()
    protected static async coreSchemasFileIncludesPackageDeclaration() {
        this.assertCoreSchemaFileIncludes('package schemas')
    }

    @test()
    protected static async goFileIsValid() {
        this.moveToGoDir()
        await this.go.exec('build', './...')
    }

    private static async assertCoreFileIncludesSchema(name: string) {
        const struct = await this.importStructForSchema(name)
        this.assertCoreSchemaFileIncludes(struct)
    }

    private static assertCoreSchemaFileIncludes(needle: string) {
        const contents = this.loadCoreSchemasFile()

        assert.doesInclude(
            contents,
            needle,
            'core_schemas.go missing expected content'
        )
    }

    private static async importStructForSchema(name: string) {
        const imported = await this.importBuilder(name)
        const struct = this.renderSchemaAsStruct(imported)

        return struct
    }

    private static loadCoreSchemasFile() {
        return diskUtil.readFile(this.coreSchemaGoFilepath)
    }

    private static renderSchemaAsStruct(imported: Schema) {
        return this.renderer.render(imported, {
            language: 'go',
        })
    }

    private static async importBuilder(name: string) {
        return (await this.Service('import').importDefault(
            this.getBuilderFilepath(name)
        )) as Schema
    }

    private static async createSchema(name: string) {
        const results = await this.Action('schema', 'create').execute({
            nameReadable: 'A schema i built!',
            nameCamel: name,
            version: this.version,
        })

        assert.isFalsy(
            results.errors,
            'Expected no errors when creating schema.'
        )
    }

    private static getBuilderFilepath(name: string) {
        return this.resolvePath(
            this.skillDir,
            'src',
            'schemas',
            versionUtil.generateVersion().dirValue,
            `${name}.builder.ts`
        )
    }

    private static get coreSchemaGoFilepath() {
        return diskUtil.resolvePath(this.goDir, 'schemas/core_schemas.go')
    }

    private static async sync() {
        const results = await this.Action('schema', 'sync', {
            shouldAutoHandleDependencies: true,
        }).execute({
            shouldGenerateCoreSchemaTypes: true,
            schemaLookupDir: this.resolvePath(this.skillDir, 'src'),
        })

        assert.isFalsy(
            results.errors,
            'Expected no errors when syncing core schemas in a go project.'
        )

        return results
    }

    private static moveToGoDir() {
        this.cwd = this.goDir
        this.go.setCwd(this.cwd)
        this.clearFixtures()
    }
}
