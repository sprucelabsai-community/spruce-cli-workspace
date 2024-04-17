import { FieldTemplateItem, SchemaTemplateItem } from '@sprucelabs/schema'
import uniq from 'lodash/uniq'
import uniqWith from 'lodash/uniqWith'

export interface SchemaImport {
    package: string
    importAs: string
}

const importExtractorUtil = {
    extractFieldImports(fields: FieldTemplateItem[]): SchemaImport[] {
        const imports: (SchemaImport & { namePascal: string })[] = fields.map(
            (item) => ({
                package: item.package,
                importAs: item.importAs,
                namePascal: item.namePascal,
            })
        )

        const uniqueImports = uniqWith(
            imports,
            (i1, i2) => i1.package === i2.package && i1.importAs === i2.importAs
        )

        const schemaName = uniqueImports.find(
            (i) => i.importAs.toLowerCase() === 'schema'
        )
        if (schemaName) {
            throw new Error(
                `${schemaName.namePascal} has importAs="Schema", which is a reserved word`
            )
        }

        const aliases: Record<string, string> = {}
        uniqueImports.forEach((item) => {
            if (item.importAs in aliases) {
                throw new Error(
                    `${item.namePascal} has a public importAs="${item.importAs}"`
                )
            }
        })

        return uniqueImports
    },

    extractSchemaImports(schemas: SchemaTemplateItem[]): string[] {
        const imports: string[] = []

        schemas.forEach((schema) => {
            imports.push(...(schema.imports ?? []))
        })

        return uniq(imports)
    },
} as const

export default importExtractorUtil
