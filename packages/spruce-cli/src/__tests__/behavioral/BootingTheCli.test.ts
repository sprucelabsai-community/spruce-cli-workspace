import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert, generateId } from '@sprucelabs/test-utils'
import AbstractCliTest from '../../tests/AbstractCliTest'

export default class BootingTheCliTest extends AbstractCliTest {
    @test()
    protected static async canBootTheCli() {
        const cli = await this.Cli()
        assert.isTruthy(cli)
    }

    @test()
    protected static async cliSetsTerminalTitleBasedOnSkillSlugOnBoot() {
        const dest = this.resolvePath('package.json')
        diskUtil.writeFile(dest, '{}')

        const auth = this.Service('auth')
        const namespace = generateId().replace(/\d+/g, '')

        auth.updateCurrentSkill({
            apiKey: generateId(),
            id: generateId(),
            name: generateId(),
            slug: namespace,
        })

        let wasHit = false
        let passedTitle: string | undefined

        this.ui.setTitle = (title: string) => {
            passedTitle = title
            wasHit = true
        }

        await this.Cli()

        assert.isTrue(wasHit)
        assert.isEqual(passedTitle, namespace)
    }
}
