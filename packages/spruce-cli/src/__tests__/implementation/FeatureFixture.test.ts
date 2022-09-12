import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import AbstractCliTest from '../../tests/AbstractCliTest'
import testUtil from '../../tests/utilities/test.utility'

export default class FeatureFixtureTest extends AbstractCliTest {
	private static cacheDirs: string[] = []
	private static cacheKey = `feature-fixture-${new Date().getTime()}`

	@test()
	protected static async setsUpCachedDir() {
		const cachedDir = await this.installSkill()

		this.cacheDirs.push(cachedDir)
	}

	@test()
	protected static async setsUpSecondCachedDir() {
		const cachedDir = await this.installSkill()

		this.cacheDirs.push(cachedDir)
	}

	public static async afterAll() {
		await super.afterAll()

		if (testUtil.shouldCleanupTestSkillDirs()) {
			// first dir should stay because it's the cached source
			assert.isTrue(diskUtil.doesDirExist(this.cacheDirs[0]))

			// all other dirs are deleted
			assert.isFalse(diskUtil.doesDirExist(this.cacheDirs[1]))
		}
	}

	private static async installSkill() {
		const fixture = this.FeatureFixture({ shouldGenerateCacheIfMissing: true })

		await fixture.installFeatures(
			[
				{
					code: 'skill',
					options: {
						name: 'cache-cleaning',
						description: 'testing deleting cached dirs',
					},
				},
			],
			this.cacheKey
		)

		const cachedDir = this.resolvePath('')
		assert.isTrue(diskUtil.doesDirExist(cachedDir))
		return cachedDir
	}
}
