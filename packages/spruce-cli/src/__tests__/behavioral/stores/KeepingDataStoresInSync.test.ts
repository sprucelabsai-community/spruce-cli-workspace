import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test'
import { errorAssertUtil } from '@sprucelabs/test-utils'
import { FeatureActionResponse } from '../../../features/features.types'
import AbstractSkillTest from '../../../tests/AbstractSkillTest'
import testUtil from '../../../tests/utilities/test.utility'

export default class KeepingDataStoresInSyncTest extends AbstractSkillTest {
	protected static skillCacheKey = 'stores'
	protected static badStoreDest: string
	protected static async beforeAll() {
		await super.beforeAll()
		this.badStoreDest = this.resolvePath('src/stores/Bad.store.ts')
	}

	protected static async beforeEach() {
		await super.beforeEach()
		diskUtil.deleteFile(this.badStoreDest)
	}

	@test()
	protected static async hasSyncAction() {
		assert.isFunction(this.Action('store', 'sync').execute)
	}

	@test()
	protected static async syncsNothingToStart() {
		const results = await this.syncStores()

		assert.isLength(results.files, 0)
	}

	@test()
	protected static async badFileReturnsError() {
		diskUtil.writeFile(this.badStoreDest, 'throw new Error("Cheese!")')

		const results = await this.syncStores()
		assert.isArray(results.errors)
		assert.isLength(results.errors, 1)

		errorAssertUtil.assertError(results.errors[0], 'FAILED_TO_IMPORT', {
			file: 'Bad.store.ts',
		})
	}

	@test()
	protected static async generatesValidTypeFile() {
		const results = await this.Action('store', 'create').execute({
			nameReadable: 'Bid',
			nameReadablePlural: 'Bids',
			namePascal: 'Bid',
		})

		await this.validateFiles(results)
	}

	@test()
	protected static async fileIsValidAfterSync() {
		const results = await this.syncStores()

		await this.validateFiles(results)
	}

	@test()
	protected static async canAddSecondStore() {
		const results = await this.Action('store', 'create').execute({
			nameReadable: 'Person',
			nameReadablePlural: 'People',
			namePascal: 'Person',
		})

		await this.validateFiles(results)
	}

	private static async validateFiles(results: FeatureActionResponse) {
		const typesFile = testUtil.assertFileByNameInGeneratedFiles(
			'stores.types.ts',
			results.files
		)

		const mapFile = testUtil.assertFileByNameInGeneratedFiles(
			'stores.ts',
			results.files
		)

		const checker = this.Service('typeChecker')

		await Promise.all([checker.check(typesFile), checker.check(mapFile)])
	}

	private static async syncStores() {
		return this.Action('store', 'sync').execute({})
	}
}
