import {
    CORE_NAMESPACE,
    CORE_SCHEMA_VERSION,
    diskUtil,
} from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import AbstractSchemaTest from '../../../tests/AbstractSchemaTest'
import testUtil from '../../../tests/utilities/test.utility'

export default class HandlesRelatedSchemasTest extends AbstractSchemaTest {
    @test()
    protected static async relatedSchemasGeneratesValidFiles() {
        const { syncResults: results } = await this.installCopyAndSync()

        assert.isUndefined(results.errors)
        testUtil.assertFileByNameInGeneratedFiles(
            /testPerson\.schema/,
            results.files
        )

        testUtil.assertFileByNameInGeneratedFiles(/pet\.schema/, results.files)

        testUtil.assertFileByNameInGeneratedFiles(
            /nested-schema\.schema/,
            results.files
        )

        await this.assertValidActionResponseFiles(results)
    }

    @test()
    protected static async nestedSchemasInDynamicFields() {
        await this.installSchemaFeature('schemas')
        const schemasDir = this.resolvePath('src', 'schemas')

        await diskUtil.copyDir(
            this.resolveTestPath('dynamic_key_schemas'),
            schemasDir
        )

        const results = await this.Action('schema', 'sync').execute({})

        const typesPath = this.resolveHashSprucePath(
            'schemas',
            'schemas.types.ts'
        )
        const typesContent = diskUtil.readFile(typesPath)

        assert.doesInclude(
            typesContent,
            "[fullyQualifiedEventName:string]: { schemaId: 'eventSignature', version: 'v2020_07_22', values: SpruceSchemas.TestingSchemas.v2020_07_22.EventSignature } | { schemaId: 'eventSignature2', version: 'v2020_07_22', values: SpruceSchemas.TestingSchemas.v2020_07_22.EventSignature2 }"
        )

        await this.Service('typeChecker').check(typesPath)

        const schemaMatch = testUtil.assertFileByNameInGeneratedFiles(
            'mercuryContract.schema.ts',
            results.files
        )

        await this.Service('typeChecker').check(schemaMatch)
    }

    @test()
    protected static async generatesCoreSchemasFirstSoSchemasCanRelateToThem() {
        const { syncResults } = await this.installCopyAndSync()

        assert.isFalsy(syncResults.errors)
        assert.isTruthy(syncResults.files)

        testUtil.assertCountsByAction(syncResults.files, {
            generated: syncResults.files.length,
            updated: 0,
            skipped: 0,
        })
    }

    @test()
    protected static async makesSureMixinSchemaFieldsDontCopySchemaToLocal() {
        const { syncResults } = await this.installCopyAndSync()

        assert.isFalsy(syncResults.errors)
        assert.isTruthy(syncResults.files)

        const matches = syncResults.files.filter(
            (f) => f.name === 'skillCreator.schema.ts'
        )

        assert.isLength(matches, 1)
        assert.doesInclude(matches[0].path, CORE_SCHEMA_VERSION.dirValue)
        assert.doesInclude(matches[0].path, CORE_NAMESPACE.toLowerCase())
        assert.doesNotInclude(matches[0].path, 'testing')
    }

    private static async installCopyAndSync(testDir = 'related_schemas') {
        const cli = await this.installSchemaFeature('schemas')
        const source = this.resolveTestPath(testDir)
        const destination = this.resolvePath('src/schemas')

        await diskUtil.copyDir(source, destination)

        const syncResults = await this.Action('schema', 'sync').execute({})

        return { cli, syncResults }
    }
}
