import { test } from '@sprucelabs/test-utils'
import AbstractInstanceTest from './AbstractInstanceTest'
import { generateExpectedInstanceTestContents } from './testFileContentsGenerators'

export default class InstanceBasedTestingTest extends AbstractInstanceTest {
    @test()
    protected static async ifNoTestsExistCreatesInstanceTest() {
        const name = 'My First Test'
        const expected = generateExpectedInstanceTestContents(name)
        await this.createTestAndAssertContentsEqual(name, expected)
    }

    @test()
    protected static async secondTestAlsoInstance() {
        const name = 'My Second Test'
        const expected = generateExpectedInstanceTestContents(name)
        await this.createTestAndAssertContentsEqual(name, expected, true)
    }
}
