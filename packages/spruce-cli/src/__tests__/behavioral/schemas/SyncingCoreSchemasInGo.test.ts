import globby from '@sprucelabs/globby'
import { buildSchema, Schema, SchemaTypesRenderer } from '@sprucelabs/schema'
import {
    CORE_NAMESPACE,
    diskUtil,
    namesUtil,
    randomUtil,
    versionUtil,
} from '@sprucelabs/spruce-skill-utils'
import { test, assert, generateId } from '@sprucelabs/test-utils'
import CommandServiceImpl from '../../../services/CommandService'
import LintService from '../../../services/LintService'
import SchemaTemplateItemBuilder from '../../../templateItemBuilders/SchemaTemplateItemBuilder'
import AbstractSkillTest from '../../../tests/AbstractSkillTest'
import testUtil from '../../../tests/utilities/test.utility'

export default class SyncingSchemasInGoTest extends AbstractSkillTest {
    protected static skillCacheKey = 'schemas'
    private static goDir: string
    private static builder1Name = 'aSchemaIBuilt'
    private static builder2Name = 'anotherSchemaIBuilt'
    private static renderer: SchemaTypesRenderer
    private static goModuleName = randomUtil.rand([
        'my-skill',
        'awesome-skill',
        'super-skill',
    ])

    private static readonly version = versionUtil.generateVersion().constValue
    private static skillNamespace: string = CORE_NAMESPACE
    private static schemaTemplateItemBuilder: SchemaTemplateItemBuilder
    private static goFullModuleName: string

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
        this.schemaTemplateItemBuilder = new SchemaTemplateItemBuilder(
            CORE_NAMESPACE
        )
    }

    @test()
    protected static async canSyncCoreSchemasWithoutError() {
        this.moveToGoDir()

        this.goFullModuleName = await this.go.initGoProject(this.goModuleName)
        await this.sync()

        const tsFiles = await globby('**/*.ts', {
            cwd: this.cwd,
            ignore: ['go/pkg/**'],
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

    @test()
    protected static async canRenderNestedSchemas() {
        const schema2 = await this.importBuilder(this.builder2Name)
        schema2.fields = {
            ...schema2.fields,
            hasNestedSchema: {
                type: 'schema',
                options: {
                    schema: nestedSchema,
                },
            },
            dateOfBirth: {
                type: 'date',
            },
        }

        diskUtil.writeFile(
            this.getBuilderFilepath(this.builder2Name),
            `import { buildSchema } from '@sprucelabs/schema'

export default buildSchema(${JSON.stringify(schema2, null, 4)})`
        )

        await this.lintBuilders()

        schema2.namespace = this.skillNamespace
        const expected = this.renderSchemaAsStruct(schema2)

        this.moveToGoDir()
        await this.sync()

        this.assertCoreSchemaFileIncludes(expected)
    }

    @test()
    protected static async generatedFileShouldPassVet() {
        this.moveToGoDir()
        await this.go.vet()
    }

    @test()
    protected static async writesSchemaFileForEachSchemaFound() {
        this.moveToGoDir()
        const results = await this.sync()
        const generated = ['nestedSchema', 'anotherSchemaIBuilt']
        for (const schema of generated) {
            const path = testUtil.assertFileByPathInGeneratedFiles(
                `schemas/${this.skillNamespace.toLowerCase()}/${this.version}/${namesUtil.toSnake(schema)}.go`,
                results.files
            )
            const contents = diskUtil.readFile(path)
            assert.doesInclude(
                contents,
                `package ${this.version}`,
                'Did not include expected package declaration.'
            )
        }
    }

    @test()
    protected static async canActuallyUseGeneratedSchemasInGoTest() {
        this.moveToGoDir()
        const testSrc = buildGoTest({
            pwd: this.goFullModuleName,
            name: generateId(),
            age: Date.now() % 100,
            version: this.version,
        })

        diskUtil.writeFile(
            this.resolvePath(this.cwd, 'test_schema.go'),
            testSrc
        )

        await this.go.exec('test', './...')
    }

    private static async lintBuilders() {
        LintService.enableLinting()
        await this.Service('lint').fix(`**/*.builder.ts`)
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
        imported.namespace = this.skillNamespace
        const struct = this.renderSchemaAsStruct(imported)

        return struct
    }

    private static loadCoreSchemasFile() {
        return diskUtil.readFile(this.coreSchemaGoFilepath)
    }

    private static renderSchemaAsStruct(imported: Schema) {
        const templateItems = this.schemaTemplateItemBuilder.buildTemplateItems(
            {
                [CORE_NAMESPACE]: [imported],
            }
        )

        return this.renderer.render(imported, {
            language: 'go',
            schemaTemplateItems: templateItems,
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

const nestedSchema = buildSchema({
    id: 'nestedSchema',
    fields: {
        name: {
            type: 'text',
        },
        age: {
            type: 'number',
        },
    },
})

const buildGoTest = (options: {
    pwd: string
    name: string
    age: number
    version: string
}) => `
package goschemas

import (
	"testing"
	spruce "${options.pwd}/schemas/spruce/${options.version}"
)

func TestMakeASchemaIBuilt(t *testing.T) {
	data := map[string]interface{}{
		"name": "${options.name}",
		"age":  ${options.age},
	}

	result, err := spruce.MakeNestedSchema(data)
	if err != nil {
		t.Fatalf("MakeNestedSchema failed: %v", err)
	}

	if result.Name != "${options.name}" {
		t.Errorf("Expected Name to be '${options.name}', got '%s'",
			result.Name)
	}

	if result.Age != ${options.age} {
		t.Errorf("Expected Age to be ${options.age}, got %f",
			result.Age)
	}
}
`
