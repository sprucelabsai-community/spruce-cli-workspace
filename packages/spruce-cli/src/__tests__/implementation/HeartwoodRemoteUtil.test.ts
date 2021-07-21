import AbstractSpruceTest, { test, assert } from '@sprucelabs/test'
import { errorAssertUtil } from '@sprucelabs/test-utils'
import { REMOTES } from '../../features/event/constants'
import {
	heartwoodRemoteUtil,
	HEARTWOOD_REMOTES,
} from '../../features/view/utilities/heartwoodRemote.utility'

export default class HeartwoodRemoteUtilTest extends AbstractSpruceTest {
	@test()
	protected static async canCreateHeartwoodRemoteUtil() {
		assert.isTruthy(heartwoodRemoteUtil)
	}

	@test()
	protected static async cantSetBadRemote() {
		const err = assert.doesThrow(() =>
			//@ts-ignore
			heartwoodRemoteUtil.buildViewWatchUrl('aoeuaoeu')
		)
		errorAssertUtil.assertError(err, 'INVALID_PARAMETERS', {
			parameters: ['remote'],
		})
	}

	@test()
	protected static canSetGoodRemote() {
		for (const env of Object.keys(REMOTES)) {
			//@ts-ignore
			const expected = HEARTWOOD_REMOTES[env]
			assert.isString(
				expected,
				`HEARTWOOD_REMOTES does not have an entry for ${env}!`
			)

			const actual = heartwoodRemoteUtil.buildViewWatchUrl(env as any)
			assert.isEqual(actual, expected)
		}
	}
}
