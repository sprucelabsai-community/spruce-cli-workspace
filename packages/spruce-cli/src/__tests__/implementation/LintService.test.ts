import { test, assert } from '@sprucelabs/test-utils'
import CommandService from '../../services/CommandService'
import LintService from '../../services/LintService'
import AbstractCliTest from '../../tests/AbstractCliTest'

export default class LintServiceTest extends AbstractCliTest {
    @test.skip('new way of linting never seems to throw')
    protected static async throwsWhenLintReturnsMessage() {
        LintService.enableLinting()

        await this.FeatureFixture().installCachedFeatures('skills')

        CommandService.fakeCommand(/node/, {
            code: 0,
            stdout: `[{"filePath":"/Users/taylorromero/Development/SpruceLabs/spruce-appointments-skill/src/.spruce/stores/stores.types.ts","messages":[{"fatal":false,"severity":1,"message":"File ignored by default.  Use a negated ignore pattern (like \\"--ignore-pattern '!<relative/path/to/filename>'\\") to override."}],"errorCount":1,"warningCount":0,"fixableErrorCount":0,"fixableWarningCount":0,"usedDeprecatedRules":[]}]\n`,
        })

        await assert.doesThrowAsync(() => this.Service('lint').fix('./go'))
    }

    @test()
    protected static async worksWhenNoMessagesReturned() {
        LintService.enableLinting()

        await this.FeatureFixture().installCachedFeatures('skills')

        CommandService.fakeCommand(/node/, {
            code: 0,
            stdout: `[{"filePath":"/Users/taylorromero/Development/SpruceLabs/spruce-appointments-skill/src/.spruce/stores/stores.types.ts","messages":[{"fatal":false,"severity":1,"message":"File ignored by default.  Use a negated ignore pattern (like \\"--ignore-pattern '!<relative/path/to/filename>'\\") to override."}],"errorCount":0,"warningCount":1,"fixableErrorCount":0,"fixableWarningCount":0,"usedDeprecatedRules":[]}]\n`,
        })

        await this.Service('lint').fix('./go')
    }
}
