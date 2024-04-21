import { test, assert } from '@sprucelabs/test-utils'
import ServiceFactory from '../../../services/ServiceFactory'
import AbstractSkillTest from '../../../tests/AbstractSkillTest'

export default class SyncingViewsLintsFilesTest extends AbstractSkillTest {
    protected static skillCacheKey = 'views'

    protected static async beforeEach() {
        await super.beforeEach()
        this.commandFaker.fakeCommand(/.*/, 0)
        ServiceFactory.setFactoryClass('lint', MockLintService)
    }

    @test()
    protected static async shouldLintGeneratedFiles() {
        await this.createView()
        await this.executeSync()

        MockLintService.assertWasHit()
    }

    @test()
    protected static async fixesWithExpectedPattern() {
        await this.executeSync()
        const file = this.resolvePath('src/.spruce/views/views.ts')
        MockLintService.assertFixPattern(file)
    }

    private static async executeSync() {
        await this.Action('view', 'sync').execute({})
    }

    private static async createView() {
        await this.Action('view', 'create').execute({
            nameReadable: 'Test view!',
            namePascal: 'testView',
            viewModel: 'Card',
            viewType: 'view',
        })
    }
}

class MockLintService {
    private static wasHit = false
    private static fixPattern: string
    public async fix(pattern: string) {
        MockLintService.wasHit = true
        MockLintService.fixPattern = pattern
    }

    public static assertWasHit() {
        assert.isTrue(this.wasHit, `Lint service was not hit!`)
    }

    public static assertFixPattern(pattern: string) {
        assert.isEqual(this.fixPattern, pattern)
    }
}
