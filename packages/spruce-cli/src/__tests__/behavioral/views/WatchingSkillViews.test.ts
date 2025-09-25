import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import WatchAction from '../../../features/view/actions/WatchAction'
import CommandServiceImpl from '../../../services/CommandService'
import AbstractSkillTest from '../../../tests/AbstractSkillTest'

export default class WatchingSkillViewsTest extends AbstractSkillTest {
    protected static skillCacheKey = 'views'
    protected static oldBootExecute: any
    private static action: WatchAction
    private static wasHit = false

    protected static async beforeEach() {
        await super.beforeEach()
        this.wasHit = false
        this.action = this.Action('view', 'watch')

        CommandServiceImpl.fakeCommand(
            'SHOULD_WATCH_VIEWS=true MAXIMUM_LOG_PREFIXES_LENGTH=0 yarn boot',
            {
                code: 0,
                callback: () => {
                    this.wasHit = true
                },
            }
        )
    }

    @test()
    protected static async hasWatchSkillViewsEvent() {
        assert.isFunction(this.action.execute)
    }

    @test()
    protected static async shouldCallBoot() {
        void this.action.execute()

        await this.wait(10)

        assert.isTrue(
            this.wasHit,
            'did not run yarn boot with expected env vars'
        )
    }

    @test()
    protected static async doesNotCrashIfUsingCustomRemote() {
        const envFile = this.resolvePath('.env')
        const envContents = diskUtil.readFile(envFile)
        const updated = envContents.replace(
            'HOST="http://127.0.0.1:8081"',
            'HOST="custom"'
        )
        diskUtil.writeFile(envFile, updated)
        const results = await this.action.execute()
        assert.isFalsy(results.errors, 'Should not have errors')
    }
}
