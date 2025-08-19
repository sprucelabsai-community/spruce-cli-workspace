import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { assert, test } from '@sprucelabs/test-utils'
import AbstractInstanceTest from './AbstractInstanceTest'
import { generateExpectedStaticTestContents } from './testFileContentsGenerators'

export default class StaticTestsWhenAlreadyExistsTest extends AbstractInstanceTest {
    @test()
    protected static async canCreateStaticTestsWhenAlreadyExists() {
        const testFile =
            await this.createTestAndGetCreatedFilePath('AFirstTest')

        diskUtil.writeFile(
            testFile,
            generateExpectedStaticTestContents('AFirstTest')
        )

        await this.createTestAndAssertContentsEqual(
            'ASecondTest',
            generateExpectedStaticTestContents('ASecondTest'),
            true
        )

        diskUtil.deleteFile(testFile)

        await this.createTestAndAssertContentsEqual(
            'AThirdTest',
            generateExpectedStaticTestContents('AThirdTest'),
            true
        )
    }

    @test()
    protected static async createsInstanceBasedTestIfStaticNotPartOfMethodDeclaration() {
        const testsPath = this.resolvePath('src/__tests__')
        diskUtil.deleteDir(testsPath)
        const testFile =
            await this.createTestAndGetCreatedFilePath('InstanceBasedTest')

        let contents = diskUtil.readFile(testFile)
        contents += '\n\nstatic'
        diskUtil.writeFile(testFile, contents)

        const testFile2 = await this.createTestAndGetCreatedFilePath(
            'InstanceBasedTest2',
            true
        )
        contents = diskUtil.readFile(testFile2)
        assert.doesInclude(
            contents,
            '@suite',
            'Should have created an instance based test'
        )
    }
}
