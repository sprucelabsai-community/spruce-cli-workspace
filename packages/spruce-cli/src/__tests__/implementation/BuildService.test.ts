import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import AbstractCliTest from '../../tests/AbstractCliTest'

export default class BuildServiceTest extends AbstractCliTest {
	@test()
	protected static buildServiceExists() {
		const service = this.Service('build')
		assert.isTruthy(service)
	}

	@test()
	protected static async canBuildSkill() {
		await this.installSkill('skills')

		const testFile = "const testVar = 'hello world'\nconsole.log(testVar)\n"
		const destination = this.resolvePath('src/test.ts')
		diskUtil.writeFile(destination, testFile)

		const service = this.Service('build')
		await service.build()

		const builtFilePath = this.resolvePath('build/test.js')
		const contents = diskUtil.readFile(builtFilePath)

		assert.isEqual(
			contents,
			`"use strict";
const testVar = 'hello world';
console.log(testVar);
//# sourceMappingURL=test.js.map`
		)
	}

	private static async installSkill(cacheKey?: string) {
		await this.FeatureFixture().installCachedFeatures(cacheKey ?? 'skills')
	}
}
