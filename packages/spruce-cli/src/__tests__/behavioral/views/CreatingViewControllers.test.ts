import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import CreateAction from '../../../features/view/actions/CreateAction'
import AbstractSkillTest from '../../../tests/AbstractSkillTest'

export default class CreatingViewControllersTest extends AbstractSkillTest {
    protected static skillCacheKey = 'views'

    @test()
    protected static async canCreateListViewController() {
        const action = this.Action('view', 'create') as CreateAction
        const results = await action.execute({
            viewType: 'view',
            isRoot: false,
            viewModel: 'List',
            nameReadable: 'My List',
            namePascal: 'MyList',
        })

        assert.isFalsy(results.errors)

        const file = results.files?.[0]
        assert.isTruthy(file?.path)
        const contents = diskUtil.readFile(file.path)

        assert.doesInclude(contents, 'extends AbstractViewController<List>')
    }
}
