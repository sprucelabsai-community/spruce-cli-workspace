import { test, assert } from '@sprucelabs/test-utils'
import CommandService from '../../../services/CommandService'
import AbstractCliTest from '../../../tests/AbstractCliTest'
import testUtil from '../../../tests/utilities/test.utility'

export default class CreatingASkillTest extends AbstractCliTest {
    protected static async beforeEach() {
        await super.beforeEach()
        CommandService.fakeCommand(new RegExp(/npm.*?install .*?/gis), {
            code: 0,
        })
    }

    @test()
    protected static async creatingAtADestinationAsksForSkillDetailsOnce() {
        const promise = this.Action('skill', 'create', {
            shouldAutoHandleDependencies: true,
        }).execute({ destination: 'taco' })

        await this.waitForInput()

        await this.ui.sendInput('adventure')
        await this.ui.sendInput('i would not')

        const results = await promise

        testUtil.assertFileByPathInGeneratedFiles(
            /taco\/package\.json/gis,
            results.files
        )

        const { hints } = results

        assert.doesInclude(hints, 'cd taco')
    }
}
