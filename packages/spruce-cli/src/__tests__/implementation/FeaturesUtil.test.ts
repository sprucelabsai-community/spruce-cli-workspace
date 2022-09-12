import AbstractSpruceTest, { test, assert } from '@sprucelabs/test-utils'
import featuresUtil from '../../features/feature.utilities'

export default class FeaturesUtilTest extends AbstractSpruceTest {
	@test('SyncAction.ts to sync', '/wahtever/SyncAction.ts', 'sync')
	@test(
		'SetRemoteAction.ts to setRemote',
		'/wahtever/setRemoteAction.ts',
		'setRemote'
	)
	protected static async generatesActionFromFile(
		path: string,
		expected: string
	) {
		const actual = featuresUtil.filePathToActionCode(path)
		assert.isEqual(actual, expected)
	}
}
