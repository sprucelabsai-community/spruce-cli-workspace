import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test'
import CommandService from '../../../services/CommandService'
import AbstractCliTest from '../../../tests/AbstractCliTest'
import testUtil from '../../../tests/utilities/test.utility'

export default class CreatingANodeModuleTest extends AbstractCliTest {
	@test()
	protected static async hasCreateAction() {
		assert.isFunction(this.Action('node', 'create').execute)
	}

	@test()
	protected static async canCreateAtDestination() {
		CommandService.setMockResponse(new RegExp(/yarn add/gis), {
			code: 0,
		})
		const promise = this.Action('node', 'create', {
			shouldAutoHandleDependencies: true,
		}).execute({ destination: 'new-module' })

		await this.waitForInput()
		await this.ui.sendInput('new module')
		await this.ui.sendInput('such a good description!')

		const results = await promise

		testUtil.assertFileByPathInGeneratedFiles(
			/new-module\/package\.json/gis,
			results.files
		)

		assert.isFalse(diskUtil.doesFileExist(this.resolvePath('package.json')))
	}

	@test()
	protected static async canBuildNodeModule() {
		await this.Action('node', 'create', {
			shouldAutoHandleDependencies: true,
		}).execute({
			name: 'build test',
			description: 'yes!',
		})

		await this.Service('build').build()
	}
}
