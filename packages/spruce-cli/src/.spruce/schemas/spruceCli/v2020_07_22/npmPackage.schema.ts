import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'

const npmPackageSchema: SpruceSchemas.SpruceCli.v2020_07_22.NpmPackageSchema = {
    id: 'npmPackage',
    version: 'v2020_07_22',
    namespace: 'SpruceCli',
    name: '',
    fields: {
        /** . */
        name: {
            type: 'text',
            isRequired: true,
            options: undefined,
        },
        /** . */
        version: {
            type: 'text',
            options: undefined,
        },
        /** . */
        isDev: {
            type: 'boolean',
            options: undefined,
        },
    },
}

SchemaRegistry.getInstance().trackSchema(npmPackageSchema)

export default npmPackageSchema
