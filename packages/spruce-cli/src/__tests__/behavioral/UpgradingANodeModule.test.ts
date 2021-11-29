import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test'
import CommandService from '../../services/CommandService'
import AbstractCliTest from '../../tests/AbstractCliTest'
import uiAssertUtil from '../../tests/utilities/uiAssert.utility'

export default class UpgradingANodeModuleTest extends AbstractCliTest {
	protected static async beforeEach() {
		await super.beforeEach()

		await this.FeatureFixture().installCachedFeatures('everythingInNode')

		const featureInstaller = this.getFeatureInstaller()
		featureInstaller.markAsPermanentlySkipped('skill')
	}

	@test()
	protected static async buildErrorsGetPassedThroughToResults() {
		CommandService.setMockResponse(/yarn (add|install)/gis, { code: 0 })
		CommandService.setMockResponse(/yarn clean.build/gis, { code: 1 })
		CommandService.setMockResponse(/yarn build.dev/gis, { code: 0 })

		await this.getEmitter().on('feature.did-execute', () => {
			return {
				errors: undefined,
			}
		})

		const results = await this.Action('node', 'upgrade').execute({})

		assert.isTruthy(results.errors)
	}

	@test()
	protected static async upgradingWritesExpectedFiles() {
		const shouldNotBeFound = ['src/.spruce/skill.ts', 'src/.spruce/features']

		const results = await this.Action('node', 'upgrade').execute({})

		assert.isFalsy(results.errors)

		for (const search of shouldNotBeFound) {
			const doesExist = diskUtil.doesFileExist(this.resolvePath(search))
			assert.isFalse(doesExist, `Should not have found ${search}`)
		}
	}

	@test()
	protected static async shouldReWriteNodeDirsAndSkipIndx() {
		for (const file of ['tsconfig.json', 'src/index.ts']) {
			const tsConfig = this.resolvePath(file)
			diskUtil.writeFile(tsConfig, 'beenChanged')
		}

		CommandService.setMockResponse(/yarn/gi, {
			code: 0,
		})

		const promise = this.Action('node', 'upgrade').execute({})

		await uiAssertUtil.assertRendersConfirmWriteFile(this.ui)

		assert.isEqual(
			diskUtil.readFile(this.resolvePath('src/index.ts')),
			'beenChanged'
		)

		await promise
	}
}
