import { Schema } from '@sprucelabs/schema'
import { namesUtil } from '@sprucelabs/spruce-skill-utils'

const schemaUtil = {
    generateNamesForSchema(schema: Schema) {
        return {
            nameReadable: schema.name ?? schema.id,
            nameCamel: namesUtil.toCamel(schema.id),
            namePascal: namesUtil.toPascal(schema.id),
        }
    },

    generateCacheKey(options: {
        id: string
        namespace?: string
        version?: string
    }) {
        return `${options.id}-${options.namespace ?? 'no-namespace'}-${
            options.version
        }`
    },
}

export default schemaUtil
