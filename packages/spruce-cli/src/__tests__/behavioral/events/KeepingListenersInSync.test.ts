import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test'
import { FeatureActionResponse } from '../../../features/features.types'
import AbstractEventTest from '../../../tests/AbstractEventTest'
import testUtil from '../../../tests/utilities/test.utility'

export default class KeepingListenersInSyncTest extends AbstractEventTest {
	@test()
	protected static async hasSyncAction() {
		assert.isFunction(this.Action('event', 'sync.listeners').execute)
	}

	@test()
	protected static async deletingAListener() {
		await this.FeatureFixture().installCachedFeatures('events')

		await this.createBootListener('did-boot')
		const results = await this.createBootListener('will-boot')

		this.deleteLastFile(results)

		const syncResults = await this.Action('event', 'sync.listeners').execute({})

		const listenerMap = testUtil.assertFileByNameInGeneratedFiles(
			'listeners.ts',
			syncResults.files
		)

		await this.Service('typeChecker').check(listenerMap)
	}

	private static deleteLastFile(results: FeatureActionResponse) {
		const path = results.files?.pop()?.path
		assert.isString(path)

		diskUtil.deleteFile(path)
	}

	private static async createBootListener(name: 'will-boot' | 'did-boot') {
		const results = await this.Action('event', 'listen').execute({
			namespace: 'skill',
			eventName: name,
		})
		assert.isFalsy(results.errors)
		return results
	}
}
