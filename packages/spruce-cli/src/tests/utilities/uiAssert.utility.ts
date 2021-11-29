import { assert } from '@sprucelabs/test'
import SpyInterface from '../../interfaces/SpyInterface'

const uiAssertUtil = {
	async assertRendersSelect(ui: SpyInterface) {
		await ui.waitForInput()

		const last = ui.getLastInvocation()
		assert.isTruthy(
			last.options.options.choices,
			`I expected a select, I did not find one!`
		)
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

export default uiAssertUtil
