import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test'
import { errorAssert } from '@sprucelabs/test-utils'
import '@sprucelabs/spruce-store-plugin'
import CommandService from '../../../services/CommandService'
import AbstractSkillTest from '../../../tests/AbstractSkillTest'
import testUtil from '../../../tests/utilities/test.utility'

export default class CreatingDataStoresTest extends AbstractSkillTest {
	protected static skillCacheKey = 'stores'

	@test()
	protected static async hasCreateStoreAction() {
		assert.isFunction(this.Action('store', 'create').execute)
	}

	@test()
	protected static async getsNoStoresBackFromHealthCheck() {
		const health = await this.cli.checkHealth({ shouldRunOnSourceFiles: true })

		assert.isFalsy(health.skill.errors)
		//@ts-ignore
		assert.isTruthy(health.store)
		//@ts-ignore
		assert.isFalsy(health.store.errors)
		//@ts-ignore
		assert.isArray(health.store.stores)
		//@ts-ignore
		assert.isLength(health.store.stores, 0)
	}

	@test()
	protected static async generatesValidStoreFile() {
		const results = await this.Action('store', 'create').execute({
			nameReadable: 'Person',
			nameReadablePlural: 'People',
			namePascal: 'Person',
		})

		assert.isFalsy(results.errors)

		const path = testUtil.assertFileByNameInGeneratedFiles(
			'People.store.ts',
			results.files
		)

		await this.Service('typeChecker').check(path)
	}

	@test()
	protected static async generatesAMapFile() {
		const file = this.resolveHashSprucePath('stores', 'stores.ts')
		assert.isTrue(diskUtil.doesFileExist(file))
		await this.Service('typeChecker').check(file)
	}

	@test()
	protected static async getsOneStoresBackFromHealthCheck() {
		const health = await this.cli.checkHealth({ shouldRunOnSourceFiles: true })
		//@ts-ignore
		assert.isTruthy(health.store)
		//@ts-ignore
		assert.isFalsy(health.store.errors)
		//@ts-ignore
		assert.isLength(health.store.stores, 1)
		//@ts-ignore
		assert.isEqual(health.store.stores[0].name, 'People')
	}

	@test()
	protected static async canGenerateASecondStoreFile() {
		const results = await this.Action('store', 'create').execute({
			nameReadable: 'Bid',
			nameReadablePlural: 'Bids',
			namePascal: 'Bid',
		})

		assert.isFalsy(results.errors)

		const path = testUtil.assertFileByNameInGeneratedFiles(
			'Bids.store.ts',
			results.files
		)

		await this.Service('typeChecker').check(path)
	}

	@test()
	protected static async getsSecondStoresBackFromHealthCheck() {
		const health = await this.cli.checkHealth({ shouldRunOnSourceFiles: true })

		//@ts-ignore
		assert.isTruthy(health.store)
		//@ts-ignore
		assert.isFalsy(health.store.errors)
		//@ts-ignore
		assert.isLength(health.store.stores, 2)
		//@ts-ignore
		assert.isEqual(health.store.stores[0].name, 'Bids')
		//@ts-ignore
		assert.isEqual(health.store.stores[1].name, 'People')
	}

	@test()
	protected static async errorsWhenGeneratingAStoreWithTheSameName() {
		const results = await this.Action('store', 'create').execute({
			nameReadable: 'Bid',
			nameReadablePlural: 'Bids',
			namePascal: 'Bid',
		})

		assert.isTruthy(results.errors)
		errorAssert.assertError(results.errors[0], 'STORE_EXISTS')
	}

	@test()
	protected static async storeFactoryAndStoresAreTyped() {
		const results = await this.Action('store', 'create').execute({
			nameReadable: 'Product',
			nameReadablePlural: 'Products',
			namePascal: 'Product',
		})

		const path = testUtil.assertFileByNameInGeneratedFiles(
			'Products.store.ts',
			results.files
		)

		const storeContents = diskUtil
			.readFile(path)
			.replace(
				'type ProductsStoreOptions = UniversalStoreOptions',
				'type ProductsStoreOptions = UniversalStoreOptions & {hello: string}'
			)

		diskUtil.writeFile(path, storeContents)

		const testFile = this.resolveTestPath('store-test.ts.hbs')
		const testContents = diskUtil.readFile(testFile)

		const dest = this.resolvePath('src', 'test.ts')
		diskUtil.writeFile(dest, testContents)

		await this.Service('typeChecker').check(dest)
	}

	@test()
	protected static async doesNotCreateAbstractTestFileBecauseTestIsNotInstalled() {
		assert.isFalse(
			diskUtil.doesFileExist(CreatingDataStoresTest.getAbstractTestPath())
		)
	}

	@test()
	protected static async upgradeRestoresDataStoreTypes() {
		CommandService.setMockResponse('yarn rebuild', {
			code: 0,
		})

		CommandService.setMockResponse(/yarn add/gis, {
			code: 0,
		})

		const storesFile = this.resolveHashSprucePath('stores/stores.types.ts')
		diskUtil.deleteFile(storesFile)
		await this.Action('node', 'upgrade').execute({})
		assert.isTrue(diskUtil.doesFileExist(storesFile))
	}

	private static getAbstractTestPath(): string {
		return this.resolvePath('src', 'tests', 'AbstractDataStoreTest.ts')
	}
}
