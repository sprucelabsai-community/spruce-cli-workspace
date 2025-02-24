import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test } from '@sprucelabs/test-utils'
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
}
