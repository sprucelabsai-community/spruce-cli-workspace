import { assert, test } from '@sprucelabs/test-utils'
import AbstractSkillTest from '../../../tests/AbstractSkillTest'

export default class UpgradingASkillSkippingBuildTest extends AbstractSkillTest {
    protected static skillCacheKey = 'skills'
    @test()
    protected static async canSkipCleaningAndBuildingOnUpgrade() {
        this.commandFaker.fakeInstall()
        this.commandFaker.fakeCleanBuild(1)

        const { errors } = await this.Action('node', 'upgrade').execute({
            shouldBuild: false,
        })

        assert.isFalsy(errors, 'Should not have tried to build.')
    }
}
