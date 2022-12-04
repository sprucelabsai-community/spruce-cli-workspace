import { buildSchema, SchemaValues } from '@sprucelabs/schema'
import AbstractAction from '../../AbstractAction'
import { ActionOptions, FeatureActionResponse } from '../../features.types'
import PermissionStore from '../stores/PermissionStore'
import PermissionWriter from '../writers/PermissionWriter'

export default class SyncAction extends AbstractAction<OptionsSchema> {
	public invocationMessage = 'Syncing permissions... 🛡'
	public optionsSchema = schema
	public readonly commandAliases: string[] = ['sync.permissions']

	private permissions: PermissionStore
	private writer: PermissionWriter

	public constructor(options: ActionOptions) {
		super(options)
		this.permissions = this.Store('permission')
		this.writer = this.Writer('permission')
	}

	public async execute(
		options?: SyncPermissionsOptions
	): Promise<FeatureActionResponse> {
		const { shouldSyncCorePermissions } = this.validateAndNormalizeOptions(
			options ?? {}
		)

		const map = await this.permissions.fetchContracts({
			shouldSyncCorePermissions,
		})
		const typesFiles = await this.writer.writeTypesFile(this.cwd, map)

		const local = await this.permissions.loadLocalPermissions()
		const combinedFiles = await this.writer.writeCombinedFile(this.cwd, {
			contracts: local,
		})

		return {
			files: [...typesFiles, ...combinedFiles],
			summaryLines: ['Permissions synced'],
		}
	}
}

const schema = buildSchema({
	id: 'syncPermissions',
	fields: {
		shouldSyncCorePermissions: {
			type: 'boolean',
		},
	},
})

type OptionsSchema = typeof schema
export type SyncPermissionsOptions = SchemaValues<OptionsSchema>
