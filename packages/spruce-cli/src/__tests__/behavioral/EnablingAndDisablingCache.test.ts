import { test, assert } from '@sprucelabs/test'
import { errorAssert } from '@sprucelabs/test-utils'
import {
	DISABLE_NPM_CACHE_COMMAND,
	ENABLE_NPM_CACHE_COMMAND,
} from '../../features/cache/constants'
import CommandService from '../../services/CommandService'
import AbstractCliTest from '../../tests/AbstractCliTest'

export default class EnablingAndDisablingCacheTest extends AbstractCliTest {
	@test()
	protected static async cacheFeatureIsAlwaysOn() {
		const isInstalled = await this.getFeatureInstaller().isInstalled('cache')
		assert.isTrue(isInstalled)
	}

	@test()
	protected static hasEnableFeature() {
		assert.isFunction(this.Action('cache', 'enable').execute)
	}

	@test()
	protected static async returnsErrorWhenEnablingIfDockerIsNotInstalled() {
		CommandService.fakeCommand(/which docker/gis, {
			code: 1,
		})

		const results = await this.Action('cache', 'enable').execute({})
		assert.isTruthy(results.errors)

		errorAssert.assertError(results.errors[0], 'MISSING_DEPENDENCIES', {
			dependencies: [
				{
					name: 'Docker',
				},
			],
		})
	}

	@test()
	protected static async returnsErrorWhenDockerNotEnabled() {
		CommandService.fakeCommand(/npm config/gis, {
			code: 1,
		})

		const results = await this.Action('cache', 'enable').execute({})
		assert.isTruthy(results.errors)

		errorAssert.assertError(results.errors[0], 'DOCKER_NOT_STARTED')
	}

	@test()
	protected static async canEnableCache() {
		CommandService.fakeCommand(/which docker/gis, {
			code: 0,
		})
		CommandService.fakeCommand(ENABLE_NPM_CACHE_COMMAND, {
			code: 0,
		})
		CommandService.fakeCommand(DISABLE_NPM_CACHE_COMMAND, {
			code: 0,
		})

		const results = await this.Action('cache', 'enable').execute({})
		assert.isFalsy(results.errors)
	}

	@test()
	protected static hasDisableFeature() {
		assert.isFunction(this.Action('cache', 'disable').execute)
	}

	@test()
	protected static async returnsErrorWhenDisablingIfDockerIsNotInstalled() {
		CommandService.fakeCommand(/which docker/gis, {
			code: 1,
		})

		const results = await this.Action('cache', 'disable').execute({})
		assert.isTruthy(results.errors)

		errorAssert.assertError(results.errors[0], 'MISSING_DEPENDENCIES', {
			dependencies: [
				{
					name: 'Docker',
				},
			],
		})
	}

	@test()
	protected static async returnsErrorWhenDisablingIfDockerIsNotStarted() {
		CommandService.fakeCommand(/which docker/gis, {
			code: 0,
		})
		CommandService.fakeCommand(/npm config/gis, {
			code: 1,
		})

		const results = await this.Action('cache', 'disable').execute({})
		assert.isTruthy(results.errors)

		errorAssert.assertError(results.errors[0], 'MISSING_DEPENDENCIES', {
			dependencies: [
				{
					name: 'Docker',
				},
			],
		})
	}

	@test()
	protected static async returnsErrorIfCacheIsNotInstalled() {
		CommandService.fakeCommand(/npm config/gis, {
			code: 1,
			stderr: 'tsanoehusnatohu snatoh No such container staoheu saotnhu ',
		})

		const results = await this.Action('cache', 'disable').execute({})
		assert.isTruthy(results.errors)

		errorAssert.assertError(results.errors[0], 'CACHE_NOT_ENABLED')
	}

	@test()
	protected static async canEnableCacheMultipleTimes() {
		CommandService.fakeCommand(/which docker/gis, {
			code: 0,
		})
		CommandService.fakeCommand(DISABLE_NPM_CACHE_COMMAND, {
			code: 0,
		})
		CommandService.fakeCommand(ENABLE_NPM_CACHE_COMMAND, {
			code: 0,
		})

		await this.Action('cache', 'enable').execute({})
		const results = await this.Action('cache', 'enable').execute({})

		assert.isFalsy(results.errors)
	}
}
