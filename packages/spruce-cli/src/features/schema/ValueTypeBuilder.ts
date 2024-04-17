import { FieldTemplateItem, SchemaTemplateItem } from '@sprucelabs/schema'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { ValueTypes } from '@sprucelabs/spruce-templates'
import ImportService from '../../services/ImportService'
import SchemaWriter from './writers/SchemaWriter'

export default class ValueTypeBuilder {
    private writer: SchemaWriter
    private importService: ImportService

    public constructor(
        schemaGenerator: SchemaWriter,
        importService: ImportService
    ) {
        this.writer = schemaGenerator
        this.importService = importService
    }

    public async generateValueTypes(options: {
        resolvedDestination: string
        fieldTemplateItems: FieldTemplateItem[]
        schemaTemplateItems: SchemaTemplateItem[]
        globalSchemaNamespace?: string
    }) {
        const {
            resolvedDestination,
            fieldTemplateItems,
            schemaTemplateItems,
            globalSchemaNamespace,
        } = options

        if (schemaTemplateItems.length === 0) {
            return {}
        }

        const valueTypeResults = await this.writer.writeValueTypes(
            resolvedDestination,
            {
                fieldTemplateItems,
                schemaTemplateItems,
                globalSchemaNamespace,
            }
        )

        const valueTypes: ValueTypes = await this.importService.importDefault(
            valueTypeResults[0].path
        )

        diskUtil.deleteFile(valueTypeResults[0].path)

        return valueTypes
    }
}
