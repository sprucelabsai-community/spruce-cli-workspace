import { buildSchema } from '@sprucelabs/schema'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'

export default class SyncAction extends AbstractAction<OptionsSchema> {
	public invocationMessage = 'Syncing permissions... 🛡'
	public optionsSchema = schema
	public readonly commandAliases: string[] = ['sync.permissions']

	public async execute(): Promise<FeatureActionResponse> {
		const map = await this.Store('permission').fetchContracts()
		const files = await this.Writer('permission').writeTypesFile(this.cwd, map)

		return {
			files,
			summaryLines: ['Permissions synced'],
		}
	}
}

const schema = buildSchema({
	id: 'syncPermissions',
	fields: {},
})

type OptionsSchema = typeof schema
