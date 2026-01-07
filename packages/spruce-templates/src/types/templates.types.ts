import { EventContract, EventSignature } from '@sprucelabs/mercury-types'
import { SchemaTemplateItem } from '@sprucelabs/schema'
import { EventFeatureListener } from '@sprucelabs/spruce-event-utils'
import { SchemaImport } from '../utilities/importExtractor.utility'

export enum DirectoryTemplateCode {
    Skill = 'skill',
    VsCode = 'vscode',
}
export interface DirectoryTemplateContextSkill {
    name: string
    description: string
}
export interface DirectoryTemplateContextVsCode {}

export interface DirectoryTemplateContextMap {
    [DirectoryTemplateCode.Skill]: DirectoryTemplateContextSkill
    [DirectoryTemplateCode.VsCode]: DirectoryTemplateContextVsCode
}
export interface DirectoryTemplateFile {
    /** Whether this is a handlebars template file */
    isHandlebarsTemplate: boolean
    /** The full directory path before the filename */
    directory: string
    /** The relative directory path after "/templates/directories/<templateName>" */
    relativeDirectory: string
    /** The actual file name that would be output from this template */
    filename: string
    /** Path to file with leading slash */
    path: string
    /** The relative path of the output file, without a leading forward slash */
    relativePath: string
}

export interface StoreTemplateOptions {
    namePascal: string
    namePascalPlural: string
    nameSnakePlural: string
}

export interface SchemaBuilderTemplateItem {
    nameCamel: string
    description?: string | null
    namePascal: string
    nameReadable: string
    builderFunction?: string
}
export interface ErrorOptions {
    errors: ErrorTemplateItem[]
    renderClassDefinition?: boolean
}
export interface ErrorTemplateItem extends SchemaTemplateItem {
    code: string
}
export type ValueTypes = Record<
    string,
    Record<
        string,
        Record<
            string,
            Record<
                string,
                {
                    valueTypes: {
                        value: string
                        type: string
                        schemaType: string
                    }
                    valueTypeGeneratorType?: string
                }
            >
        >
    >
>
export interface TestOptions {
    namePascal: string
    nameCamel: string
    isTestFixturesInstalled: boolean
    testType?: 'static' | 'instance'
    parentTestClass?: {
        name: string
        importPath: string
        isDefaultExport: boolean
    }
}
export interface EventListenerOptions {
    fullyQualifiedEventName: string
    emitPayloadSchemaTemplateItem?: SchemaTemplateItem | null
    responsePayloadSchemaTemplateItem?: SchemaTemplateItem | null
    globalSchemaNamespace?: string
    schemaTypesFile: string
}

export interface EventSignatureTemplateItem extends Omit<
    EventSignature,
    'emitPayloadSchema'
> {
    emitPayloadSchema?: SchemaTemplateItem
    responsePayloadSchema?: SchemaTemplateItem
}

export interface EventContractTemplateItem extends EventContract {
    namePascal: string
    nameCamel: string
    namespace: string
    namespaceCamel: string
    namespacePascal: string
    imports: SchemaImport[]
    version: string
    isLocal: boolean
    eventSignatures: Record<string, EventSignatureTemplateItem>
}

export interface EventPayloadOptions {
    nameCamel: string
    version: string
}

export interface StoreTemplateItem {
    namePascalPlural: string
    nameCamelPlural: string
    optionsInterfaceName?: string
    path: string
}

export interface VcTemplateItem {
    namePascal: string
    path: string
    id: string
}

export interface ViewControllerPluginItem {
    namePascal: string
    nameCamel: string
    path: string
}

export interface ViewsOptions {
    namespaceKebab: string
    svcTemplateItems: VcTemplateItem[]
    vcTemplateItems: VcTemplateItem[]
    allTemplateItems: VcTemplateItem[]
    viewPluginItems: ViewControllerPluginItem[]
    appTemplateItem?: VcTemplateItem
}

export type ListenerTemplateItem = Omit<EventFeatureListener, 'callback'> & {
    path: string
}
