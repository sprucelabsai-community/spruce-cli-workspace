import { buildSchema, SchemaValues } from '@sprucelabs/schema'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'

const pullOptionsSchema = buildSchema({
    id: 'pullActionSchema',
    description:
        'Pulls the event contracts from Mercury down to a single file for easy distribution.',
    fields: {
        destination: {
            type: 'text',
            label: 'Destination',
            hint: 'File is always named `events.contract.ts`.',
        },
    },
})
type PullOptionsSchema = typeof pullOptionsSchema
type Options = SchemaValues<PullOptionsSchema>

export default class PullAction extends AbstractAction<PullOptionsSchema> {
    public commandAliases = ['pull.event.contracts']
    public optionsSchema = pullOptionsSchema
    public invocationMessage = 'Pulling combined event contract... 🜒'

    public async execute(options: Options): Promise<FeatureActionResponse> {
        let { destination = '.' } = this.validateAndNormalizeOptions(options)

        const filename = 'events.contract.ts'
        destination = diskUtil.resolvePath(this.cwd, destination, filename)

        const { contracts } = await this.Store('event').fetchEventContracts({
            namespaces: ['core'],
        })
        let buildEventContractImport = `import { buildEventContract } from '@sprucelabs/mercury-types'
import '${'#spruce'}/permissions/permissions.types'`

        const contents = `${buildEventContractImport}
const eventContracts = [${contracts
            .map((c) => `buildEventContract(${JSON.stringify(c, null, 2)})`)
            .join(',\n')}] as const


export default eventContracts
export type CoreEventContract = ${contracts
            .map((_, idx) => `typeof eventContracts[${idx}]`)
            .join(' & ')}
`

        const action = diskUtil.doesFileExist(destination)
            ? 'updated'
            : 'generated'

        diskUtil.writeFile(destination, contents)

        const typesFiles = await this.syncPermissions()

        return {
            files: [
                ...typesFiles,
                {
                    name: filename,
                    path: destination,
                    action,
                    description:
                        'All your Mercury core events ready for testing!',
                },
            ],
        }
    }

    private async syncPermissions() {
        const permissions = this.Store('permission')

        const coreMap = await permissions.fetchContracts({
            shouldSyncCorePermissions: true,
        })

        const heartwoodMap = await permissions.fetchContracts({
            shouldSyncCorePermissions: true,
        })

        const typesFiles = await this.Writer('permission').writeTypesFile(
            this.cwd,
            { ...coreMap, ...heartwoodMap }
        )
        return typesFiles
    }
}
