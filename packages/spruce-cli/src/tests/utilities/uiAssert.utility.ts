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
}

export default uiAssertUtil
