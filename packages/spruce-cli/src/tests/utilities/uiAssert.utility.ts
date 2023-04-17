import { assert } from '@sprucelabs/test-utils'
import SpyInterface from '../../interfaces/SpyInterface'

const uiAssert = {
	async assertRendersSelect(ui: SpyInterface) {
		await ui.waitForInput()

		const last = ui.getLastInvocation()
		assert.isTruthy(
			last.options.options.choices,
			`I expected a select, I did not find one!`
		)

		return last.options
	},

	assertSelectDidNotRenderChoice(
		ui: SpyInterface,
		value: string,
		label: string
	) {
		const last = ui.getLastInvocation()

		assert.doesNotInclude(last.options.options.choices, {
			value,
			label,
		})
	},

	assertSelectRenderChoice(ui: SpyInterface, value: string, label: string) {
		const last = ui.getLastInvocation()

		assert.doesInclude(last.options.options.choices, {
			value,
			label,
		})
	},

	assertRendersDirectorySelect(ui: SpyInterface, defaultValue: string) {
		const last = ui.getLastInvocation()

		assert.doesInclude(last.options, {
			type: 'directory',
			defaultValue: { path: defaultValue },
		})
	},

	async assertRendersConfirmWriteFile(ui: SpyInterface) {
		await ui.waitForInput()

		const last = ui.getLastInvocation()

		assert.isEqual(last.options.type, 'select')
		assert.isEqualDeep(last.options.options.choices, [
			{
				label: 'Overwrite',
				value: 'overwrite',
			},
			{ value: 'skip', label: 'Skip' },
			{ value: 'alwaysSkip', label: 'Always skip' },
		])
	},
}

export default uiAssert
