import { buildSchema } from '@sprucelabs/schema'
import { DEFAULT_GLOBAL_SCHEMA_NAMESPACE } from '@sprucelabs/spruce-skill-utils'
import syncSchemaFieldsBuilder from './syncSchemaFieldsOptions.builder'

export default buildSchema({
    id: 'syncSchemasOptions',
    name: 'Sync schemas action',
    description: 'Options for schema.sync.',
    fields: {
        ...syncSchemaFieldsBuilder.fields,
        schemaTypesDestinationDirOrFile: {
            type: 'text',
            label: 'Schema types destination directory',
            hint: 'Where I will generate schema types and interfaces.',
            defaultValue: '#spruce/schemas',
        },
        schemaLookupDir: {
            type: 'text',
            hint: 'Where I should look for your schema builders?',
            defaultValue: 'src/schemas',
        },
        moduleToImportFromWhenRemote: {
            type: 'text',
            label: 'Module import',
            hint: 'When other skills use your schemas, will they import them from a module?',
        },
        shouldInstallMissingDependencies: {
            type: 'boolean',
            label: 'Auto install missing dependencies',
        },
        shouldEnableVersioning: {
            type: 'boolean',
            defaultValue: true,
            label: 'Enable versioning',
            hint: 'Should we use versioning?',
            isPrivate: true,
        },
        globalSchemaNamespace: {
            type: 'text',
            label: 'Global namespace',
            hint: "The name you'll use when accessing these schemas, e.g. SpruceSchemas",
            isPrivate: true,
            defaultValue: DEFAULT_GLOBAL_SCHEMA_NAMESPACE,
        },
        shouldFetchRemoteSchemas: {
            type: 'boolean',
            label: 'Fetch remote schemas',
            isPrivate: true,
            hint: 'I will pull in schemas from other features.',
            defaultValue: true,
        },
        shouldFetchLocalSchemas: {
            type: 'boolean',
            label: 'Fetch local schemas',
            isPrivate: true,
            hint: 'I will look in schemaLookupDir to load local schemas.',
            defaultValue: true,
        },
        shouldFetchCoreSchemas: {
            type: 'boolean',
            label: 'Fetch core schemas',
            isPrivate: true,
            hint: 'Should I pull in core schemas too?',
            defaultValue: true,
        },
        shouldGenerateCoreSchemaTypes: {
            type: 'boolean',
            label: 'Generate core schemas',
            isPrivate: true,
            hint: 'Used only for updating the @sprucelabs/spruce-core-schemas. Ensures core schemas are generated like local schemas. Also an alias for `--shouldFetchRemoteSchemas=false --shouldFetchCoreSchemas=false --generateStandaloneTypesFile.',
        },
        registerBuiltSchemas: {
            type: 'boolean',
            label: 'Register built schemas',
            isPrivate: true,
            hint: 'Should the schemas use the SchemaRegistry for tracking?',
            defaultValue: true,
        },
        deleteDestinationDirIfNoSchemas: {
            type: 'boolean',
            label: 'Delete directory if no schemas',
            isPrivate: true,
            hint: 'Should I delete the schema directory if no schemas are found?',
            defaultValue: false,
        },
        deleteOrphanedSchemas: {
            type: 'boolean',
            label: 'Delete orphaned schemas',
            isPrivate: true,
            hint: 'Should I delete schemas where the builders are missing?',
            defaultValue: true,
        },
        generateStandaloneTypesFile: {
            label: 'Generate standalone types file',
            type: 'boolean',
            isPrivate: true,
            hint: "By default, I'll generate a types file that augments core types from @sprucelabs/spruce-core-schemas. Setting this to true will generate a stand alone types file.",
            defaultValue: false,
        },
        syncingMessage: {
            label: ' message',
            type: 'text',
            defaultValue: 'Syncing schemas...',
            isPrivate: true,
        },
    },
})
