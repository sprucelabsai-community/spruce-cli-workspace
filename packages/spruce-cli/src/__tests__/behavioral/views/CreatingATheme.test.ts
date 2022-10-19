import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import { errorAssert } from '@sprucelabs/test-utils'
import AbstractSkillTest from '../../../tests/AbstractSkillTest'

export default class CreatingAThemeTest extends AbstractSkillTest {
	protected static skillCacheKey = 'views'

	@test()
	protected static async hasCreateThemeAction() {
		assert.isFunction(this.Action('view', 'createTheme').execute)
	}

	@test()
	protected static async syncsEventsFirst() {
		await this.getSkillFixture().registerCurrentSkill({
			name: 'current skill in creating a theme',
		})

		const results = await this.Action('view', 'createTheme').execute({})
		assert.isFalsy(results.errors)

		assert.isTrue(
			diskUtil.doesFileExist(
				this.resolveHashSprucePath('events/events.contract.ts')
			)
		)
	}

	@test()
	protected static async makesThemeFile() {
		assert.isTrue(diskUtil.doesFileExist(this.getThemePath()))
	}

	@test()
	protected static async makesValidThemeFile() {
		const imported = await this.Service('import').importDefault(
			this.getThemePath()
		)

		assert.isTruthy(imported)
		assert.isTrue('color1' in imported)
	}

	@test()
	protected static async cantRunTwice() {
		const results = await this.Action('view', 'createTheme').execute({})
		assert.isTruthy(results.errors)
		errorAssert.assertError(results.errors[0], 'THEME_EXISTS')
	}

	@test()
	protected static async doesNotSyncEventsIfAlreadySynced() {
		const emitter = this.emitter
		let hitCount = 0

		diskUtil.deleteFile(this.getThemePath())

		await emitter.on('feature.will-execute', async (payload) => {
			const { featureCode, actionCode } = payload

			if (featureCode === 'event' && actionCode === 'sync') {
				hitCount++
			}
		})

		await this.Action('view', 'createTheme').execute({})

		assert.isEqual(hitCount, 0)
	}

	private static getThemePath(): string {
		return this.resolvePath('src', 'themes', 'skill.theme.ts')
	}
}
