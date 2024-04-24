import { test, assert, generateId } from '@sprucelabs/test-utils'
import CommandService from '../../../services/CommandService'
import LintService from '../../../services/LintService'
import AbstractCliTest from '../../../tests/AbstractCliTest'

export default class LintServiceTest extends AbstractCliTest {
    private static wasFixInvoked = false
    protected static async beforeEach() {
        await super.beforeEach()
        LintService.enableLinting()

        this.wasFixInvoked = false
        this.commandFaker.on(/node/, () => {
            this.wasFixInvoked = true
        })
    }

    @test.skip('new way of linting never seems to throw')
    protected static async throwsWhenLintReturnsMessage() {
        await this.FeatureFixture().installCachedFeatures('skills')

        CommandService.fakeCommand(/node/, {
            code: 0,
            stdout: `[{"filePath":"/Users/taylorromero/Development/SpruceLabs/spruce-appointments-skill/src/.spruce/stores/stores.types.ts","messages":[{"fatal":false,"severity":1,"message":"File ignored by default.  Use a negated ignore pattern (like \\"--ignore-pattern '!<relative/path/to/filename>'\\") to override."}],"errorCount":1,"warningCount":0,"fixableErrorCount":0,"fixableWarningCount":0,"usedDeprecatedRules":[]}]\n`,
        })

        await assert.doesThrowAsync(() => this.Service('lint').fix('./go'))
    }

    @test()
    protected static async worksWhenNoMessagesReturned() {
        await this.FeatureFixture().installCachedFeatures('skills')

        CommandService.fakeCommand(/node/, {
            code: 0,
            stdout: `[{"filePath":"/Users/taylorromero/Development/SpruceLabs/spruce-appointments-skill/src/.spruce/stores/stores.types.ts","messages":[{"fatal":false,"severity":1,"message":"File ignored by default.  Use a negated ignore pattern (like \\"--ignore-pattern '!<relative/path/to/filename>'\\") to override."}],"errorCount":0,"warningCount":1,"fixableErrorCount":0,"fixableWarningCount":0,"usedDeprecatedRules":[]}]\n`,
        })

        await this.fix('./go')
    }

    @test()
    protected static async defaultIgnore() {
        assert.isEqualDeep(LintService.ignorePatterns, [
            'valueType.tmp',
            '.md',
            '.js',
            '.gitignore',
            '.mjs',
            '.spruce',
            '.nvmrc',
            'tsconfig.json',
        ])
    }

    @test()
    protected static async willIgnoreFirstItemInIgnoreList() {
        const pattern = generateId()

        this.setIgnorePatterns([pattern])

        await this.fixAndAssertNotFixed(pattern)
        await this.fix('whatever.ts')

        this.assertWasFixed()
    }

    @test()
    protected static async willIgnoreSecondItemInIgnoreList() {
        const pattern = generateId()

        this.setIgnorePatterns(['whatever.ts', pattern])

        await this.fixAndAssertNotFixed(pattern)
    }

    @test()
    protected static async ignoresPartialMatch() {
        const pattern = generateId()

        this.setIgnorePatterns([pattern + '/whatever.ts'])

        await this.fixAndAssertNotFixed('whatever.ts')
    }

    @test()
    protected static async partialMatchesOtherWay() {
        this.setIgnorePatterns(['valueType.tmp'])
        await this.fixAndAssertNotFixed(this.resolvePath('valueType.tmp'))
    }

    private static async fixAndAssertNotFixed(pattern: string) {
        await this.fix(pattern)
        this.assertWasNotFixed()
    }

    private static assertWasFixed() {
        assert.isTrue(
            this.wasFixInvoked,
            'Fix was not invoked when it should have been.'
        )
    }

    private static assertWasNotFixed() {
        assert.isFalse(
            this.wasFixInvoked,
            `Fix was invoked when it should not have been.`
        )
    }

    private static setIgnorePatterns(patterns: string[]) {
        LintService.ignorePatterns = patterns
    }

    private static async fix(pattern: string) {
        await this.Service('lint').fix(pattern)
    }
}
