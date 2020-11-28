import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { GraphicsInterface } from '../../../types/cli.types'
import { Script, CallbackPlayer } from '../ScriptPlayer'

const script: Script = [
	'Hey there! 👋',
	"I'm Sprucebot. 🌲🤖",
	"I'll be your narrator on this journey to creating your first experience.",
	async (player) => {
		await player.ui.waitForEnter('Lets get started...')
	},
	async (player) => {
		player.ui.clear()
	},
	async (player) => {
		await renderDoors(player.ui)
	},
	'You are strolling through the forest when you stumble onto a clearing.',
	'In the clearing there are two heavy, thick, doors.',
	'They are free standing. You walk around them a few times before...',
	'You see words scribed onto each.',
	'The door to the left says, "Quick start. 30 minutes."',
	'The door to the right says, "Immersive. 4-6 weeks."',
	'"Four to six week onboarding!?" You say out loud. "What the actual sh**!?"',
	"You don't have 4-6 weeks to do onboarding. But, you take pride in your work and doing things the right way.",
	async (player) => {
		return await chooseOnboardingAdventure(player)
	},
]

export async function renderDoors(ui: GraphicsInterface) {
	await ui.renderImage(
		diskUtil.resolvePath(__dirname, '../../../../docs/images/doors.jpg'),
		{
			width: 100,
			height: 35,
		}
	)
}

export async function chooseOnboardingAdventure(player: CallbackPlayer) {
	const answer = await player.ui.prompt({
		type: 'select',
		label: 'Which door do you choose?',
		isRequired: true,
		options: {
			choices: [
				{
					label: 'Left door (30 minutes)',
					value: 'short',
				} as const,
				{
					label: 'Right door (4-6 weeks)',
					value: 'immersive',
				} as const,
			],
		},
	})

	switch (answer) {
		case 'immersive':
			return player.redirect('onboarding.immersive')
		case 'short':
			return player.redirect('onboarding.short')
	}
}

export default script
