import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'

const bootErrorSchema: SpruceErrors.SpruceCli.BootErrorSchema = {
    id: 'bootError',
    namespace: 'SpruceCli',
    name: 'boot error',
    fields: {},
}

SchemaRegistry.getInstance().trackSchema(bootErrorSchema)

export default bootErrorSchema
