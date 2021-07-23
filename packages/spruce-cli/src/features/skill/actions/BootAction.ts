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

	public async execute(options: Options): Promise<FeatureActionResponse> {
		const command = this.Service('command')

		let script = 'boot'

		if (options.local) {
			script += '.local'
		}

		let runningPromise: any

		const bootPromise = new Promise((resolve, reject) => {
			runningPromise = this.boot(command, script, resolve, reject)
		})

		const meta = {
			isBooted: true,
			kill: command.kill.bind(command),
			pid: command.pid() as number,
			promise: runningPromise,
			bootPromise,
		}

		bootPromise.then(() => (meta.isBooted = true))

		if (!options.shouldReturnImmediately) {
			await bootPromise
		}

		return {
			meta,
		}
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
					if (!isBooted && data.search(':: Skill booted') > -1) {
						isBooted = true
						resolve(undefined)
					}
				},
			})

			if (!isBooted) {
				isBooted = true
				resolve(undefined)
			}

			return results
		} catch (err) {
			let mappedErr = err
			if (mappedErr.message.search(/cannot find module/gis) > -1) {
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
