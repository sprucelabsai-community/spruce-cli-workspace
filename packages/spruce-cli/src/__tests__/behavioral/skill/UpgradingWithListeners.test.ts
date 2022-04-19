import { eventResponseUtil } from '@sprucelabs/spruce-event-utils'
import { test, assert } from '@sprucelabs/test'
import SpruceError from '../../../errors/SpruceError'
import { FeatureCode } from '../../../features/features.types'
import CommandService from '../../../services/CommandService'
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

		CommandService.fakeCommand(new RegExp(/yarn/), {
			code: 0,
		})

		let wasHit = false

		await this.getEmitter().on(
			'feature.will-execute',
			async ({ featureCode, actionCode }) => {
				if (featureCode === 'event' && actionCode === 'sync.listeners') {
					wasHit = true
				}
			}
		)

		const results = await this.getEmitter().emit('feature.will-execute', {
			featureCode: 'node',
			actionCode,
		})

		const { errors } = eventResponseUtil.getAllResponsePayloadsAndErrors(
			results,
			SpruceError
		)

		assert.isFalsy(errors)

		assert.isEqual(wasHit, shouldHit)
	}
}
