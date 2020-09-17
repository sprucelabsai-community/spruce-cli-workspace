import { Command } from 'commander'
import OnboardingStore from '../stores/OnboardingStore'
import AbstractCommand, { ICommandOptions } from './AbstractCommand'

interface IOnboardingCommandOptions extends ICommandOptions {
	stores: {
		onboarding: OnboardingStore
	}
}

export default class OnboardingCommand extends AbstractCommand {
	private onboardingStore: OnboardingStore
	public constructor(options: IOnboardingCommandOptions) {
		super(options)
		this.onboardingStore = options.stores.onboarding
	}
	public attachCommands(program: Command) {
		program
			.command('onboarding')
			.option('-r, --reset', 'Start count over')
			.description('Start onboarding')
			.action(this.onboarding)
	}

	public onboarding = async (cmd: Command) => {
		if (cmd.reset) {
			this.onboardingStore.resetRunCount()
		}

		const runCount = this.onboardingStore.getRunCount()

		// Enable onboarding and increment count
		this.onboardingStore.setIsEnabled(true)
		this.onboardingStore.incrementRunCount()

		this.term.clear()
		this.term.renderHero(runCount == 0 ? 'You made it!' : 'Onboarding')

		if (runCount === 0) {
			await this.term.waitForEnter(
				`It's Sprucebot again. It's a lot more cozy in here than online, but that won't slow us down!`
			)
		} else {
			await this.term.waitForEnter('You ready to get this party started?')
		}

		this.term.renderLine(
			`Ok, before we get started you should understand the Pillars of a Skill. Since humans hate writing documentation, take a sec and review ${
				runCount === 0 ? 'the rest of ' : ''
			}the information here: http://developer.spruce.ai/#/getting-started?id=pillars-of-a-skill`
		)

		await this.term.waitForEnter()

		const confirm = await this.term.confirm(
			`Wow, you read that fast! You read everything?`
		)

		await this.term.waitForEnter(
			confirm
				? 'Great, so lets prove it!'
				: '**ERROR INVALID ANSWER** Great, so lets prove it!'
		)

		const quiz = this.getQuizComponent({
			questions: {
				events: {
					type: 'select',
					question: 'The event engine is driven by',
					answers: ['Mercury', 'Jupiter', 'EventEmitter', 'Apollo'],
				},
				definitions: {
					type: 'select',
					question: 'How do you model data to work over the wire in Spruce?',
					answers: [
						'Using schemas definitions {{name}}.definitions.ts',
						'Using data models {{name}}.dataModel.ts',
						'Using the ORM',
						'Using json file {{name}}.json',
					],
				},
				builders: {
					type: 'select',
					question: 'How do you render front end components?',
					answers: [
						'builders',
						'React',
						'Nextjs',
						'Front ends are not possible',
					],
				},
			},
		})

		const results = await quiz.present({ headline: 'Spruce POP QUIZ!' })

		this.term.clear()
		this.term.renderLine('All done! Lets see how you did!')

		await this.term.waitForEnter()
		await quiz.scorecard()

		if (results.percentCorrect < 1) {
			// eslint-disable-next-line @typescript-eslint/no-floating-promises
			this.term.waitForEnter('Hmmmmm...')
		}

		this.term.renderLine(
			"Ok, that's all for now. When you're ready to start your skill, run `spruce skill:create`."
		)

		// eslint-disable-next-line @typescript-eslint/no-floating-promises
		this.term.waitForEnter(`I'll see you there!`)
	}
}
