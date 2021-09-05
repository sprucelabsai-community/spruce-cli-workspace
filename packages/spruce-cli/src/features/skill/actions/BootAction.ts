import { SpruceSchemas } from '#spruce/schemas/schemas.types'
import bootSkillOptionsSchema from '#spruce/schemas/spruceCli/v2020_07_22/bootSkillOptions.schema'
import SpruceError from '../../../errors/SpruceError'
import CommandService from '../../../services/CommandService'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'

type OptionsSchema = SpruceSchemas.SpruceCli.v2020_07_22.BootSkillOptionsSchema
type Options = SpruceSchemas.SpruceCli.v2020_07_22.BootSkillOptions

export interface BootMeta {
	kill: () => void
	pid: number
	promise: Promise<void>
	isBooted: boolean
	bootPromise: Promise<void>
}

export default class BootAction extends AbstractAction<OptionsSchema> {
	public optionsSchema: OptionsSchema = bootSkillOptionsSchema
	public commandAliases = ['boot']
	public invocationMessage = 'Booting skill... ⚡️'
	private onDataHandler: ((msg: string) => void) | null | undefined
	private onErrorHandler: ((msg: string) => void) | null | undefined

	public async execute(options: Options): Promise<FeatureActionResponse> {
		const command = this.Service('command')

		let script = 'boot'
		this.onDataHandler = options.onData
		this.onErrorHandler = options.onError

		if (options.local) {
			script += '.local'
		}

		let runningPromise: any

		let bootPromise = new Promise((resolve, reject) => {
			runningPromise = this.boot(command, script, resolve, reject)
		})

		const meta = {
			isBooted: false,
			kill: command.kill.bind(command),
			pid: command.pid() as number,
			promise: runningPromise,
			bootPromise,
		}

		return new Promise((resolve, reject) => {
			bootPromise = bootPromise
				.then(() => {
					meta.isBooted = true
					return { meta }
				})
				.catch((err) => {
					reject(err)
					return err
				})

			if (!options.shouldReturnImmediately) {
				void bootPromise.then(() => resolve({ meta }))
			} else {
				meta.bootPromise = bootPromise

				resolve({
					meta,
				})
			}
		})
	}

	private async boot(
		command: CommandService,
		script: string,
		resolve: (value: unknown) => void,
		reject: (reason?: any) => void
	) {
		let isBooted = false
		try {
			const results = await command.execute(`yarn ${script}`, {
				onData: (data) => {
					this.onDataHandler?.(data)
					if (!isBooted && data.search(':: Skill booted') > -1) {
						isBooted = true
						resolve(undefined)
					}
				},
				onError: (data) => {
					this.onErrorHandler?.(data)
				},
			})

			if (!isBooted) {
				isBooted = true
				resolve(undefined)
			}

			return results
		} catch (err: any) {
			let mappedErr = err
			if (
				mappedErr.message.search(/Error: cannot find module.*?build\/index/gi) >
				-1
			) {
				mappedErr = new SpruceError({
					code: 'BOOT_ERROR',
					friendlyMessage: 'You must build your skill before you can boot it!',
				})
			}

			if (!isBooted) {
				reject(mappedErr)
			} else {
				throw mappedErr
			}
		}

		return null
	}
}
