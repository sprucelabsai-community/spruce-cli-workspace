import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test'
import CommandService from '../../services/CommandService'
import PkgService from '../../services/PkgService'
import AbstractSkillTest from '../../tests/AbstractSkillTest'

export default class PkgServiceTest extends AbstractSkillTest {
	protected static skillCacheKey = 'skills'
	private static pkg: PkgService

	protected static async beforeEach() {
		await super.beforeEach()
		this.pkg = this.Service('pkg')
	}

	@test()
	protected static async canCreatePkgService() {
		assert.isTruthy(this.pkg)
	}

	@test()
	protected static async installANonSpruceLabsModuleMakesItsVersionAnActualVersion() {
		const version = this.pkg.get('dependencies.dotenv')
		assert.isNotEqual(version, 'latest')
	}

	@test()
	protected static async handlesAtLatestInName() {
		CommandService.setMockResponse(new RegExp(/yarn/gis), {
			code: 0,
		})

		await this.pkg.install('@sprucelabs/heartwood-view-controllers@latest')

		this.pkg.isInstalled('@sprucelabs/heartwood-view-controllers')
	}

	@test()
	protected static async ifInstallingOnlySpruceModulesShouldNotRunNPMAdd() {
		CommandService.setMockResponse(
			new RegExp(/npm.*?install.*?--no-progress/gis),
			{
				code: 1,
			}
		)

		const { totalInstalled } = await this.pkg.install(
			'@sprucelabs/jest-json-reporter'
		)

		assert.isEqual(totalInstalled, 1)

		const expectedPath = this.resolvePath(
			'node_modules',
			'@sprucelabs',
			'jest-json-reporter'
		)

		assert.isTrue(
			diskUtil.doesFileExist(expectedPath),
			`No module installed at ${expectedPath}.`
		)
	}

	@test()
	protected static async installingSpruceAndOtherModulesDoesntRemoveSpruceModule() {
		const { totalInstalled } = await this.pkg.install([
			'moment',
			'@sprucelabs/spruce-calendar-utils',
		])

		assert.isEqual(totalInstalled, 2)

		const expectedPath = this.resolvePath(
			'node_modules',
			'@sprucelabs',
			'spruce-calendar-utils'
		)

		assert.isTrue(
			diskUtil.doesFileExist(expectedPath),
			`No module installed at ${expectedPath}.`
		)
	}
}
