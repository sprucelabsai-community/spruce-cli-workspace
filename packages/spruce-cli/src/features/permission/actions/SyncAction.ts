import { buildSchema } from '@sprucelabs/schema'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'

export default class SyncAction extends AbstractAction<OptionsSchema> {
	public invocationMessage = 'Syncing permissions... 🛡'
	public optionsSchema = schema

	public async execute(): Promise<FeatureActionResponse> {
		const files = await this.Writer('permission').writeTypesFile(this.cwd)

		return {
			files,
		}
	}
}

const schema = buildSchema({
	id: 'syncPermissions',
	fields: {},
})

type OptionsSchema = typeof schema
