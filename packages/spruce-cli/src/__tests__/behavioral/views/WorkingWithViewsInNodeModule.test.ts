import globby from '@sprucelabs/globby'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import CommandServiceImpl from '../../../services/CommandService'
import AbstractSkillTest from '../../../tests/AbstractSkillTest'

export default class WorkingWithViewsInNodeModuleTest extends AbstractSkillTest {
    public static skillCacheKey = 'node'

    protected static async beforeEach() {
        await super.beforeEach()
        CommandServiceImpl.fakeCommand(new RegExp(/^(?!code\b).*/), {
            code: 0,
        })
    }

    @test()
    protected static async creatingViewDoesNotWritePlugins() {
        const promise = this.Action('view', 'create', {
            shouldAutoHandleDependencies: true,
        }).execute({
            viewType: 'view',
            nameReadable: 'My Test View',
            viewModel: 'Card',
        })

        await this.waitForInput()
        await this.ui.sendInput('n')
        await this.waitForInput()
        await this.ui.sendInput('y')
        await this.waitForInput()
        await this.ui.sendInput('y')
        await this.waitForInput()
        await this.ui.sendInput('y')
        await this.waitForInput()
        await this.ui.sendInput('')
        await promise

        await this.assertNoPluginsWritten()
    }

    @test()
    protected static async upgradingDoesNotWritePlugins() {
        await this.upgrade()
        await this.assertNoPluginsWritten()
    }

    @test()
    protected static async upgradeDoesRecreateViewsTs() {
        const file = this.resolvePath('src/.spruce/views/views.ts')
        const contents = diskUtil.readFile(file)
        diskUtil.deleteFile(file)

        await this.upgrade()

        const newContents = diskUtil.readFile(file)
        assert.isEqual(newContents, contents, 'views.ts should be rewritten.')
    }

    private static async upgrade() {
        await this.Action('node', 'upgrade').execute({})
    }

    private static async assertNoPluginsWritten() {
        const matches = await globby('src/.spruce/features/*.plugin.ts', {
            cwd: this.skillDir,
        })

        assert.isLength(
            matches,
            0,
            `Should not create plugin files ${JSON.stringify(matches, null, 2)}.`
        )
    }
}
