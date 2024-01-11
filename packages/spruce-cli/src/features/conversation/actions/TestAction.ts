import { buildSchema, SchemaValues } from '@sprucelabs/schema'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'

const optionsSchema = buildSchema({
	id: 'testConversationOptions',
	description: 'Test your conversation topics.',
	fields: {
		shouldReturnImmediately: {
			type: 'boolean',
			isPrivate: true,
		},
		shouldRunSilently: {
			type: 'boolean',
			isPrivate: true,
		},
	},
})

type OptionsSchema = typeof optionsSchema
type Options = SchemaValues<OptionsSchema>
export default class TestAction extends AbstractAction<OptionsSchema> {
	public optionsSchema = optionsSchema
	public commandAliases = ['test.conversation', 'chat']
	public invocationMessage = "Let's test talking about topics... 🎙"

	private killHandler?: () => void

	public async execute(options: Options): Promise<FeatureActionResponse> {
		const { shouldReturnImmediately, shouldRunSilently } =
			this.validateAndNormalizeOptions(options)

		this.ui.startLoading('Booting skill...')

		try {
			const command = this.Service('command')
			let isWriting = false

			const promise = new Promise((resolve, reject) => {
				command
					.execute('yarn boot.local', {
						spawnOptions: shouldRunSilently
							? undefined
							: {
									stdio: [process.stdin, 'pipe', 'pipe'],
							  },

						onData: shouldRunSilently
							? undefined
							: async (data) => {
									if (!isWriting) {
										isWriting = data.search(':: Skill booted') > -1
										if (isWriting) {
											this.ui.clear()
											this.ui.stopLoading()
											process.stdout?.write(
												'? Send your first message to kick-off the conversation: '
											)
										}
									} else if (isWriting) {
										process.stdout?.write(
											data.replace('Skill :: Skill booted', '')
										)
									}
							  },
						onError: (data) => {
							if (!data.includes('warning package.json')) {
								// const err = new SpruceError({
								// 	friendlyMessage:
								// 		`Testing conversations failed because of the following error:\n\n` +
								// 		data,
								// 	code: 'EXECUTING_COMMAND_FAILED',
								// 	cmd: 'ACTION=test.conversation yarn.boot.local',
								// 	stderr: data,
								// })
								// reject(err)
							}
						},
						env: {
							ACTION: 'test.conversation',
						},
					})
					.then(resolve)
					.catch(reject)
			})

			this.killHandler = command.kill.bind(command)

			if (shouldReturnImmediately) {
				return {
					meta: {
						kill: this.killHandler,
						pid: command.pid() as number,
						promise,
					},
				}
			} else {
				await promise
			}
		} catch (err: any) {
			if (
				err.options?.stderr?.includes('SIGINT') ||
				err.options?.code === 'CONVERSATION_ABORTED'
			) {
				return {
					summaryLines: ['Conversation terminated. ✌️'],
				}
			}

			return {
				errors: [err],
			}
		}

		return {
			summaryLines: ['Talk soon! 👋'],
		}
	}

	public async kill() {
		this.killHandler?.()
	}
}
