import { SchemaTemplateItem, FieldTemplateItem } from '@sprucelabs/schema'

const templateItemUtil = {
    groupSchemaTemplatesByNamespaceAndName(
        schemaTemplateItems: SchemaTemplateItem[]
    ) {
        const hash: Record<string, Record<string, SchemaTemplateItem[]>> = {}

        schemaTemplateItems.forEach((item) => {
            if (!hash[item.namespace]) {
                hash[item.namespace] = {}
            }

            if (!hash[item.namespace][item.nameCamel]) {
                hash[item.namespace][item.nameCamel] = []
            }

            hash[item.namespace][item.nameCamel].push(item)
        })

        return hash
    },

    groupFieldItemsByNamespace(fieldTemplateItems: FieldTemplateItem[]) {
        const fieldTemplatesByType: Record<string, FieldTemplateItem[]> = {}

        fieldTemplateItems.forEach((item) => {
            if (!fieldTemplatesByType[item.camelType]) {
                fieldTemplatesByType[item.camelType] = []
            }
            fieldTemplatesByType[item.camelType].push(item)
        })
    },
} as const

export default templateItemUtil
