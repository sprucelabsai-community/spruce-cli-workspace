import { diskUtil, namesUtil } from '@sprucelabs/spruce-skill-utils'
import { assert } from '@sprucelabs/test-utils'
import CreateAction from '../../../../features/test/actions/CreateAction'
import AbstractSkillTest from '../../../../tests/AbstractSkillTest'
import testUtil from '../../../../tests/utilities/test.utility'

export default abstract class AbstractInstanceTest extends AbstractSkillTest {
    protected static skillCacheKey = 'tests'
    protected static action: CreateAction

    protected static async beforeEach() {
        await super.beforeEach()
        this.action = this.Action('test', 'create')
    }

    protected static async createTest(
        name: string,
        willPromptForSubDir = false
    ) {
        const promise = this.action.execute({
            type: 'behavioral',
            nameReadable: name,
            nameCamel: namesUtil.toCamel(name),
            namePascal: namesUtil.toPascal(name),
        })

        await this.ui.waitForInput()
        await this.ui.sendInput('')

        if (willPromptForSubDir) {
            await this.ui.waitForInput()
            await this.ui.sendInput('')
        }

        const results = await promise

        assert.isFalsy(results.errors, 'Error creating test')
        return results
    }

    protected static async createTestAndAssertContentsEqual(
        name: string,
        expected: string,
        willPromptForSubDir = false
    ) {
        const testFile = await this.createTestAndGetCreatedFilePath(
            name,
            willPromptForSubDir
        )

        const contents = diskUtil.readFile(testFile)
        assert.isEqual(
            this.normalizeWhitespace(contents),
            this.normalizeWhitespace(expected),
            'Instance test does not match expected'
        )
    }

    protected static async createTestAndGetCreatedFilePath(
        name: string,
        willPromptForSubDir = false
    ) {
        const results = await this.createTest(name, willPromptForSubDir)

        const testFile = testUtil.assertFileByNameInGeneratedFiles(
            `${namesUtil.toPascal(name)}.test.ts`,
            results.files
        )
        return testFile
    }

    protected static normalizeWhitespace(contents: string) {
        return contents.replace(/\s/g, '')
    }
}
