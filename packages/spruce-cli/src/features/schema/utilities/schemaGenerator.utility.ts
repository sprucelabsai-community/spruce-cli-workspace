import pathUtil from 'path'
import globby from '@sprucelabs/globby'
import { namesUtil } from '@sprucelabs/spruce-skill-utils'

const schemaGeneratorUtil = {
    async filterSchemaFilesBySchemaIds(
        lookupDir: string,
        schemas: { id: string; namespace?: string; version?: string }[]
    ): Promise<string[]> {
        const matches = await globby([
            pathUtil.join(lookupDir, '/**/*.schema.[t|j]s'),
            pathUtil.join(lookupDir, '/*/v*/*.go'),
        ])

        const filtered = matches.filter((match) => {
            let found = false

            for (const schema of schemas) {
                const { id, namespace, version } = schema

                const expectedPath = match.endsWith('.go')
                    ? this.buildPath(
                          namesUtil.toSnake(id),
                          '.go',
                          namespace,
                          version
                      )
                    : this.buildPath(id, '.schema.', namespace, version)

                if (match.includes(expectedPath)) {
                    found = true
                    break
                }
            }

            return !found
        })
        return filtered
    },

    buildPath(
        schemaId: string,
        suffix: string,
        namespace?: string,
        version?: string
    ): string {
        let path = pathUtil.sep + schemaId + suffix

        if (version) {
            path = pathUtil.sep + version + path
        }

        if (namespace) {
            path = namesUtil.toCamel(namespace) + path
        }

        return path
    },
}

export default schemaGeneratorUtil
