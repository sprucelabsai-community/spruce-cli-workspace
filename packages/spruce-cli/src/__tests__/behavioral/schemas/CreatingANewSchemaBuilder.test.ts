import { versionUtil } from '@sprucelabs/spruce-skill-utils'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import { errorAssert } from '@sprucelabs/test-utils'
import {
    FeatureActionResponse,
    FeatureAction,
} from '../../../features/features.types'
import SpyInterface from '../../../interfaces/SpyInterface'
import AbstractSchemaTest from '../../../tests/AbstractSchemaTest'
import testUtil from '../../../tests/utilities/test.utility'

export default class CreatingANewSchemaBuilderTest extends AbstractSchemaTest {
    @test()
    protected static async failsWhenASkillIsNotInstalled() {
        await this.Cli()
        const err = await assert.doesThrowAsync(() =>
            this.Action('schema', 'create').execute({
                nameReadable: 'Test schema!',
                namePascal: 'AnotherTest',
                nameCamel: 'anotherTest',
                description: 'this is so great!',
            })
        )

        errorAssert.assertError(err, 'FEATURE_NOT_INSTALLED')
    }

    @test()
    protected static async canBuildFileWithoutCrashing() {
        const createSchema = await this.syncSchemasAndGetCreateAction('schemas')

        const response = await createSchema.execute({
            nameReadable: 'Test schema!',
            namePascal: 'Test',
            nameCamel: 'test',
            description: 'this is so great!',
        })

        assert.isFalsy(response.errors)

        const expectedDestination = versionUtil.resolveNewLatestPath(
            this.cwd,
            'src',
            'schemas',
            '{{@latest}}',
            'test.builder.ts'
        )

        assert.isEqual(response.files?.[0].path, expectedDestination)
    }

    private static async syncSchemasAndGetCreateAction(cacheKey?: string) {
        await this.syncSchemas(cacheKey)
        const createSchema = this.Action('schema', 'create')

        return createSchema
    }

    @test()
    protected static async builderAndSchemaFilesValidate() {
        const response = await this.buildTestSchema()

        const checker = this.Service('typeChecker')

        await checker.check(response.files?.[0].path ?? '')
        await checker.check(this.schemaTypesFile)

        const builderMatch = testUtil.assertFileByNameInGeneratedFiles(
            'anotherTest.builder.ts',
            response.files
        )

        await checker.check(builderMatch)
        const schemaMatch = testUtil.assertFileByNameInGeneratedFiles(
            'anotherTest.schema.ts',
            response.files
        )

        await checker.check(schemaMatch)

        const schemaContents = diskUtil.readFile(schemaMatch)
        assert.doesInclude(schemaContents, `namespace: 'TestingSchemas'`)
    }

    @test()
    protected static async errorsWithBadVersion() {
        const action = await this.syncSchemasAndGetCreateAction('schemas')

        const results = await action.execute({
            nameReadable: 'Bad schema version!',
            namePascal: 'BadSchemaVersion',
            nameCamel: 'badSchemaVersion',
            version: 'v1',
        })

        assert.isTruthy(results.errors)
        assert.doesInclude(results.errors[0].message, /must be in the form/i)
    }

    @test()
    protected static async canBuild2SpecificVersions() {
        const action = await this.syncSchemasAndGetCreateAction('schemas')

        const firstResponse = await action.execute({
            nameReadable: 'First schema!',
            namePascal: 'FirstSchema',
            nameCamel: 'firstSchema',
            version: 'v2020_01_10',
        })

        this.validateSchemaFiles(
            firstResponse,
            'firstSchema.schema.ts',
            'v2020_01_10',
            'FirstSchema'
        )

        const secondResponse = await action.execute({
            nameReadable: 'Second schema!',
            namePascal: 'secondSchema',
            nameCamel: 'secondSchema',
            version: 'v2020_01_11',
        })

        this.validateSchemaFiles(
            secondResponse,
            'secondSchema.schema.ts',
            'v2020_01_11',
            'SecondSchema'
        )

        this.validateSchemaFiles(
            secondResponse,
            'firstSchema.schema.ts',
            'v2020_01_10',
            'FirstSchema'
        )
    }

    @test()
    protected static async asksForVersionOnSecondSchema() {
        const action = await this.syncSchemasAndGetCreateAction('schemas')

        const newVersion = versionUtil.generateVersion()

        // create old version first
        await action.execute({
            nameReadable: 'First schema!',
            namePascal: 'FirstSchema',
            nameCamel: 'firstSchema',
            version: 'v2020_01_01',
        })

        await this.assertAnswersFirstTime(action, newVersion)
        await this.assertAnswersSecondTime(action, newVersion)
    }

    // should ask if we want to use the old version we created above or a New Version
    private static async assertAnswersFirstTime(
        action: FeatureAction,
        newVersion: { intValue: number; constValue: string; dirValue: string }
    ) {
        const createPromise = action.execute({
            nameReadable: 'Second schema!',
            namePascal: 'SecondSchema',
            nameCamel: 'secondSchema',
        })

        await this.wait(1000)
        const last = this.ui.invocations[this.ui.invocations.length - 1]

        assert.isEqual(last?.command, 'prompt')
        assert.isLength(last?.options?.options?.choices, 2)
        assert.isEqualDeep(last?.options?.options?.choices, [
            {
                value: newVersion.dirValue,
                label: 'New Version',
            },
            {
                value: 'v2020_01_01',
                label: 'v2020_01_01',
            },
        ])

        await this.ui.sendInput(newVersion.dirValue)
        await createPromise
    }

    // should only have 2 options, none of which are "new version" since that was created in secondAnswers
    private static async assertAnswersSecondTime(
        action: FeatureAction,
        newVersion: { intValue: number; constValue: string; dirValue: string }
    ) {
        const createPromise = action.execute({
            nameReadable: 'Third schema',
            namePascal: 'ThirdSchema',
            nameCamel: 'thirdSchema',
        })

        await this.wait(1000)
        const term = this.ui as SpyInterface
        const last = term.invocations[term.invocations.length - 1]

        assert.isEqualDeep(last?.options?.options?.choices, [
            {
                value: newVersion.dirValue,
                label: newVersion.dirValue,
            },
            {
                value: 'v2020_01_01',
                label: 'v2020_01_01',
            },
        ])

        this.ui.sendInput(newVersion.dirValue)

        const createResults = await createPromise

        const schemaMatch = testUtil.assertFileByNameInGeneratedFiles(
            'secondSchema.schema.ts',
            createResults.files
        )

        assert.doesInclude(schemaMatch, newVersion.dirValue)
    }

    private static validateSchemaFiles(
        response: FeatureActionResponse,
        expectedFileName: string,
        expectedVersion: string,
        expectedSchemaInterfaceName: string
    ) {
        assert.isUndefined(response.errors)

        let schemaFile = testUtil.assertFileByNameInGeneratedFiles(
            expectedFileName,
            response.files
        )

        const errors = response.errors ?? []
        if (errors.length > 0) {
            assert.fail(errors[0].friendlyMessage())
        }

        assert.doesInclude(schemaFile, expectedVersion)
        const schemaContents = diskUtil.readFile(schemaFile)

        assert.doesInclude(schemaContents, `version: '${expectedVersion}'`)

        assert.doesInclude(
            schemaContents,
            new RegExp(
                'SpruceSchemas.TestingSchemas.' +
                    expectedVersion +
                    '.*?' +
                    expectedSchemaInterfaceName,
                'gis'
            )
        )
    }

    private static async buildTestSchema() {
        const action = await this.syncSchemasAndGetCreateAction('schemas')

        const response = await action.execute({
            nameReadable: 'Test schema!',
            namePascal: 'AnotherTest',
            nameCamel: 'anotherTest',
            description: 'this is so great!',
        })

        assert.isUndefined(response.errors)

        return response
    }
}
