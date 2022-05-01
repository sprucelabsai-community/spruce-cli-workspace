import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test'
import { errorAssert } from '@sprucelabs/test-utils'
import StoreStore from '../../features/store/stores/StoreStore'
import AbstractSkillTest from '../../tests/AbstractSkillTest'
import testUtil from '../../tests/utilities/test.utility'

export default class DataStoreStoreTest extends AbstractSkillTest {
	private static store: StoreStore
	private static badStoreDest: string
	protected static skillCacheKey = 'stores'

	protected static async beforeAll() {
		await super.beforeAll()
		this.badStoreDest = this.resolvePath('src/stores/Bad.store.ts')
	}

	protected static async beforeEach() {
		await super.beforeEach()
		diskUtil.deleteFile(this.badStoreDest)

		this.store = this.Store('store')
	}

	@test()
	protected static async canInstantiateDataStore() {
		assert.isTruthy(this.Store('store'))
	}

	@test()
	protected static async hasFetchStores() {
		assert.isTruthy(this.Store('store').fetchStores)
	}

	@test()
	protected static async fetchesNoStoresToStart() {
		this.cwd = this.freshTmpDir()

		const results = await this.store.fetchStores()
		assert.isLength(results, 0)
	}

	@test()
	protected static async throwsWhenStoreIsNotValid() {
		diskUtil.writeFile(this.badStoreDest, 'throw new Error("Cheese!")')

		const err = await assert.doesThrowAsync(() => this.store.fetchStores())

		errorAssert.assertError(err, 'FAILED_TO_IMPORT', {
			file: 'Bad.store.ts',
		})
	}

	@test()
	protected static async canImportAGoodStore() {
		const results = await this.Action('store', 'create').execute({
			nameReadable: 'Good',
			nameReadablePlural: 'Good',
			namePascal: 'Good',
		})

		assert.isFalsy(results.errors)

		const storeFilepath = testUtil.assertFileByNameInGeneratedFiles(
			'Good.store.ts',
			results.files
		)

		const stores = await this.store.fetchStores()
		assert.isLength(stores, 1)

		assert.doesInclude(stores, {
			className: 'GoodStore',
			path: storeFilepath,
		})
	}

	@test()
	protected static async canImportTwoGoodStores() {
		const results = await this.Action('store', 'create').execute({
			nameReadable: 'Apple',
			nameReadablePlural: 'Apples',
			namePascal: 'Apple',
		})

		assert.isFalsy(results.errors)

		const storeFilepath = testUtil.assertFileByNameInGeneratedFiles(
			'Apples.store.ts',
			results.files
		)

		const stores = await this.store.fetchStores()
		assert.isLength(stores, 2)

		assert.doesInclude(stores, {
			className: 'ApplesStore',
			path: storeFilepath,
		})
	}

	@test()
	protected static async accuratelyReportsBadStoreAfterGoodStoresAreCreated() {
		diskUtil.writeFile(this.badStoreDest, 'throw new Error("Cheese!")')

		const err = await assert.doesThrowAsync(() => this.store.fetchStores())

		errorAssert.assertError(err, 'FAILED_TO_IMPORT', {
			file: 'Bad.store.ts',
		})
	}

	@test()
	protected static async globbyPatternLooksEverywhere() {
		const expected = this.resolvePath('src', '**', '*.store.ts')

		//@ts-ignore
		assert.isEqual(this.store.generateGlobbyPattern(), expected)
	}
}
