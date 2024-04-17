import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import UpdateDependenciesAction from '../../../features/node/actions/UpdateDependenciesAction'
import AbstractSkillTest from '../../../tests/AbstractSkillTest'

export default class UpdatingDependenciesTest extends AbstractSkillTest {
    protected static skillCacheKey = 'node'

    private static action: UpdateDependenciesAction

    protected static async beforeEach() {
        await super.beforeEach()
        this.action = this.Action('node', 'updateDependencies')
    }

    @test()
    protected static async hasUpdateAction() {
        assert.isFunction(this.action.execute)
    }

    @test()
    protected static async removesLockFilesBeforeInstallAndAlsoCleansUpAfterInstall() {
        const files = ['package-lock.json', 'yarn.lock']
        for (const file of files) {
            diskUtil.writeFile(this.resolvePath(file), 'not empty')
        }

        const promise = this.action.execute({})

        await this.wait(10)

        for (const file of files) {
            assert.isFalse(diskUtil.doesFileExist(this.resolvePath(file)))
        }

        await promise

        for (const file of files) {
            const path = this.resolvePath(file)
            assert.isFalse(
                diskUtil.doesFileExist(path),
                `Expectedly found ${path}`
            )
        }
    }

    @test()
    protected static async removesAndReAddsNodeModulesFolder() {
        const dir = this.resolvePath('node_modules')

        assert.isTrue(diskUtil.doesFileExist(dir))

        const promise = this.action.execute({})

        await this.wait(100)

        assert.isFalse(diskUtil.doesFileExist(dir))

        await promise

        assert.isTrue(diskUtil.doesFileExist(dir))
    }
}
