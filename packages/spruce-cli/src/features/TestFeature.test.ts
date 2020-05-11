import path from 'path'
import { test, assert } from '@sprucelabs/test'
import fs from 'fs-extra'
import uuid from 'uuid'
import { Feature } from '../../.spruce/autoloaders/features'
import BaseTest from '../BaseTest'

export default class TestFeatureTest extends BaseTest {
	@test('Can install the test feature')
	protected static async installFeature() {
		await this.services.feature.install({
			features: [
				{
					feature: Feature.Skill,
					options: {
						name: uuid.v4(),
						description: uuid.v4()
					}
				},
				{
					feature: Feature.Test,
					options: {
						target: {
							name: './src/index'
						}
					}
				}
			]
		})

		const expectedTestFile = path.join(this.cwd, './src/index.test.ts')
		assert.isTrue(fs.existsSync(expectedTestFile))
	}
}
