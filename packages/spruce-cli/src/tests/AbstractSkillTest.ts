import { CliInterface } from '../cli'
import AbstractCliTest from './AbstractCliTest'

export default abstract class AbstractSkillTest extends AbstractCliTest {
	protected static skillDir: string
	protected static cli: CliInterface
	protected static skillCacheKey: string

	protected static async beforeAll() {
		if (!this.skillCacheKey) {
			throw new Error(
				"You must implement `protected static skillCacheKey = 'stores'"
			)
		}
		await super.beforeAll()
		this.cwd = this.skillDir = this.freshTmpDir()
		this.cli = await this.FeatureFixture().installCachedFeatures(
			this.skillCacheKey
		)
	}

	protected static async beforeEach() {
		await super.beforeEach()
		this.cwd = this.skillDir
	}
}