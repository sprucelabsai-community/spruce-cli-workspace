import { Schema } from '@sprucelabs/schema'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert, generateId } from '@sprucelabs/test-utils'
import ActionFactory from '../../../features/ActionFactory'
import {
    FeatureAction,
    FeatureActionResponse,
} from '../../../features/features.types'
import ServiceFactory from '../../../services/ServiceFactory'
import AbstractSkillTest from '../../../tests/AbstractSkillTest'

export default class UpgradingWithViewsTest extends AbstractSkillTest {
    protected static skillCacheKey = 'views'

    protected static async beforeEach() {
        await super.beforeEach()
        this.commandFaker.fakeCommand(/.*/, 0)
    }

    @test()
    protected static async restoresCombineViews() {
        await this.Action('view', 'create').execute({
            nameReadable: 'Test view!',
            namePascal: 'testView',
            viewModel: 'Card',
            viewType: 'view',
        })

        const file = this.resolvePath('src/.spruce/views/views.ts')
        const contents = diskUtil.readFile(file)

        diskUtil.deleteFile(file)

        await this.executeUpgrade()

        const updatedContents = diskUtil.readFile(file)

        assert.isEqual(updatedContents, contents)
    }

    @test()
    protected static async resultsShouldIncludeResultsOfSync() {
        ActionFactory.setActionClass('view', 'sync', FakeSyncAction)

        FakeSyncAction.executeResults.files = [
            {
                action: 'deleted',
                description: generateId(),
                name: generateId(),
                path: generateId(),
            },
        ]

        const results = await this.executeUpgrade()

        assert.doesInclude(
            results.files,
            FakeSyncAction.executeResults.files[0]
        )
    }

    private static async executeUpgrade() {
        return await this.Action('node', 'upgrade').execute({})
    }
}

class FakeSyncAction implements FeatureAction<Schema> {
    public static executeResults: FeatureActionResponse = {}
    public optionsSchema?: Schema | undefined
    public commandAliases: string[] = []
    public invocationMessage = 'going going gone'
    public async execute(): Promise<FeatureActionResponse> {
        return FakeSyncAction.executeResults
    }
}
