import { buildSchema } from '@sprucelabs/schema'

export default buildSchema({
	id: 'bootSkillOptions',
	name: 'Boot skill action',
	description: 'Boot your skill 💪',
	fields: {
		local: {
			type: 'boolean',
			label: 'Run local',
			hint: 'Will run using ts-node and typescript directly. Longer boot times',
		},
		onData: {
			type: 'raw',
			options: {
				valueType: '(msg: string) => void',
			},
		},
		onError: {
			type: 'raw',
			options: {
				valueType: '(msg: string) => void',
			},
		},
		shouldReturnImmediately: {
			label: 'Wait until skill is booted',
			type: 'boolean',
			isPrivate: true,
			hint: 'For testing. Returns immediately after executing test so the running tests can be managed programatically.',
			defaultValue: false,
			options: undefined,
		},
	},
})
