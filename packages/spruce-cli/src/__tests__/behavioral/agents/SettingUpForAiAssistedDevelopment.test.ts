import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import AbstractSkillTest from '../../../tests/AbstractSkillTest'

export default class SettingUpForAiAssistedDevelopmentTest extends AbstractSkillTest {
    protected static skillCacheKey = 'node'

    private static readonly expectedFiles = [
        'CLAUDE.md',
        'AGENTS.md',
        'docs/PROJECT.md',
    ]

    @test()
    protected static async hasSetupForAiDevelopmentAction() {
        assert.isFunction(this.Action('node', 'setupForAiDevelopment').execute)
    }

    @test()
    protected static async generatesExpectedFiles() {
        await this.execute()
        this.assertExpectedFilesExist()
    }

    @test()
    protected static async generatedFilesHaveExpectedContents() {
        this.assertFileContentsMatch('CLAUDE.md', 'markdown/CLAUDE.md.hbs')
        this.assertFileContentsMatch('AGENTS.md', 'markdown/AGENTS.md.hbs')
        this.assertFileContentsMatch(
            'docs/PROJECT.md',
            'markdown/PROJECT.md.hbs'
        )
    }

    private static assertFileContentsMatch(
        generatedFile: string,
        templateFile: string
    ) {
        const generatedContents = diskUtil.readFile(
            this.resolvePath(generatedFile)
        )
        const templateContents = this.readTemplate(templateFile)
        assert.isEqual(generatedContents, templateContents)
    }

    private static readTemplate(templatePath: string) {
        const fullPath = diskUtil.resolvePath(
            __dirname,
            '..',
            '..',
            '..',
            '..',
            '..',
            'spruce-templates',
            'src',
            'templates',
            templatePath
        )
        return diskUtil.readFile(fullPath)
    }

    private static assertExpectedFilesExist() {
        for (const file of this.expectedFiles) {
            assert.isTrue(
                diskUtil.doesFileExist(this.resolvePath(file)),
                `Expected ${file} to exist`
            )
        }
    }

    private static async execute() {
        const results = await this.Action(
            'node',
            'setupForAiDevelopment'
        ).execute({})
        assert.isFalsy(results.errors, 'Action should not return errors')
        return results
    }
}
