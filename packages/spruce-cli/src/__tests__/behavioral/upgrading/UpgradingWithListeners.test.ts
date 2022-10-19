import { eventResponseUtil } from '@sprucelabs/spruce-event-utils'
import { test, assert } from '@sprucelabs/test-utils'
import SpruceError from '../../../errors/SpruceError'
import { FeatureCode } from '../../../features/features.types'
import AbstractCliTest from '../../../tests/AbstractCliTest'

export default class UpgradingWithListeners extends AbstractCliTest {
	@test('should sync listeners when installed', 'events', true)
	@test('should not sync listeners when not installed', 'skills', false)
	@test(
		'should not sync listeners when creating node when not installed',
		'testsInNodeModule',
		false,
		'create'
	)
	@test(
		'should not sync listeners when creating node when installed',
		'events',
		false,
		'create'
	)
	protected static async upgradingSyncsListeners(
		featureCode: FeatureCode,
		shouldHit: boolean,
		actionCode = 'upgrade'
	) {
		await this.FeatureFixture().installCachedFeatures(featureCode)

		this.commandFaker.fakeCommand(new RegExp(/yarn/))

		let wasHit = false

		await this.emitter.on(
			'feature.will-execute',
			async ({ featureCode, actionCode }) => {
				if (featureCode === 'event' && actionCode === 'sync.listeners') {
					wasHit = true
				}
			}
		)

		const results = await this.emitter.emit('feature.did-execute', {
			featureCode: 'node',
			actionCode,
			results: {},
		})

		const { errors } = eventResponseUtil.getAllResponsePayloadsAndErrors(
			results,
			SpruceError
		)

		assert.isFalsy(errors)

		assert.isEqual(wasHit, shouldHit)
	}
}
