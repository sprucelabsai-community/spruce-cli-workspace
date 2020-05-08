import { assert, test } from '@sprucelabs/test'
import BaseTest from '../BaseTest'
import { Feature } from '#spruce/autoloaders/features'

export default class FeatureServiceTest extends BaseTest {
	@test('Can get feature dependencies')
	protected static async getFeatureDependencies() {
		const dependencies = this.services.feature.getFeatureDependencies({
			feature: Feature.Test
		})
		assert.isArray(dependencies)
		// Verify order
		assert.equal(dependencies?.[0].feature, Feature.Skill)
		assert.equal(dependencies?.[1].feature, Feature.Schema)
		assert.equal(dependencies?.[2].feature, Feature.Test)
	}

	@test.skip('Can get circular feature dependencies.')
	protected static async getCircularFeatureDependencies() {
		const dependencies = this.services.feature.getFeatureDependencies({
			feature: Feature.Skill
		})
		assert.isArray(dependencies)
		// Verify order
		assert.equal(dependencies?.[0].feature, Feature.Skill)
		assert.equal(dependencies?.[1].feature, Feature.Schema)
		assert.equal(dependencies?.[2].feature, Feature.Test)
	}
}
