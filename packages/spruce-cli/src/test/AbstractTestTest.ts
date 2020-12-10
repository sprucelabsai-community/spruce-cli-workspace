import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import AbstractCliTest from './AbstractCliTest'

export default class AbstractTestTest extends AbstractCliTest {
	protected static async installTests() {
		const fixture = this.FeatureFixture()
		const cli = await fixture.installCachedFeatures('tests', {
			graphicsInterface: this.ui,
		})
		return cli
	}

	protected static fixBadTest(file: string) {
		const contents = diskUtil.readFile(file)
		const passingContent = contents.replace(
			'assert.isTrue(false)',
			'assert.isTrue(true)'
		)

		diskUtil.writeFile(file, passingContent)
	}
}
