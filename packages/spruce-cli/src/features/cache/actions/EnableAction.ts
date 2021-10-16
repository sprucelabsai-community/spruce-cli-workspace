import { buildSchema, SchemaValues } from '@sprucelabs/schema'
import SpruceError from '../../../errors/SpruceError'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'
import { ENABLE_NPM_CACHE_COMMAND } from '../constants'

const optionsSchema = buildSchema({
	id: 'enableCacheAction',
	description: 'Enable npm caching so pulling node_modules is much faster.',
	fields: {},
})

type OptionsSchema = typeof optionsSchema
type Options = SchemaValues<OptionsSchema>

export default class EnableCacheAction extends AbstractAction<OptionsSchema> {
	public optionsSchema = optionsSchema
	public commandAliases = [
		'enable.cache',
		'start.cache',
		'enable.caching',
		'start.caching',
	]
	public invocationMessage = 'Enabling cache... 💪'

	public async execute(_options: Options): Promise<FeatureActionResponse> {
		try {
			await this.Service('command').execute('which docker')

			await this.Action('cache', 'disable').execute({})
			await this.Service('command').execute(ENABLE_NPM_CACHE_COMMAND)

			return {
				headline: 'Starting cache',
				summaryLines: ['Booting cache systems now. Give it a sec!'],
			}
		} catch (err: any) {
			let error = err
			if (err.options?.cmd?.includes('which')) {
				error = new SpruceError({
					code: 'MISSING_DEPENDENCIES',
					dependencies: [
						{
							name: 'Docker',
							hint: 'Get Docker here: https://www.docker.com/products/docker-desktop',
						},
					],
				})
			} else {
				error = new SpruceError({ code: 'DOCKER_NOT_STARTED' })
			}

			return {
				errors: [error],
			}
		}
	}
}
