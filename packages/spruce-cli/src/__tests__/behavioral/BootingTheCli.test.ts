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

		auth.updateCurrentSkill({
			apiKey: generateId(),
			id: generateId(),
			name: generateId(),
			slug: generateId(),
		})

		let wasHit = false

		this.ui.setTitle = () => {
			wasHit = true
		}

		await this.Cli()

		assert.isTrue(wasHit)
	}
}
