import { default as SchemaEntity } from '@sprucelabs/schema'
import * as SpruceSchema from '@sprucelabs/schema'



















import AbstractSpruceError from '@sprucelabs/error'





























export declare namespace SpruceErrors.SpruceCli {

	
	export interface VscodeNotInstalled {
		
	}

	export interface VscodeNotInstalledSchema extends SpruceSchema.Schema {
		id: 'vscodeNotInstalled',
		namespace: 'SpruceCli',
		name: 'vscode not installed',
		    fields: {
		    }
	}

	export type VscodeNotInstalledEntity = SchemaEntity<SpruceErrors.SpruceCli.VscodeNotInstalledSchema>

}


export declare namespace SpruceErrors.SpruceCli {

	
	export interface ViewPluginAlreadyExists {
		
			
			'name': string
	}

	export interface ViewPluginAlreadyExistsSchema extends SpruceSchema.Schema {
		id: 'viewPluginAlreadyExists',
		namespace: 'SpruceCli',
		name: 'View plugin already exists',
		    fields: {
		            /** . */
		            'name': {
		                type: 'text',
		                isRequired: true,
		                options: undefined
		            },
		    }
	}

	export type ViewPluginAlreadyExistsEntity = SchemaEntity<SpruceErrors.SpruceCli.ViewPluginAlreadyExistsSchema>

}


export declare namespace SpruceErrors.SpruceCli {

	
	export interface TransportAlreadyExists {
		
			/** Transport name. */
			'name': string
	}

	export interface TransportAlreadyExistsSchema extends SpruceSchema.Schema {
		id: 'transportAlreadyExists',
		namespace: 'SpruceCli',
		name: 'transport already exists',
		    fields: {
		            /** Transport name. */
		            'name': {
		                label: 'Transport name',
		                type: 'text',
		                isRequired: true,
		                options: undefined
		            },
		    }
	}

	export type TransportAlreadyExistsEntity = SchemaEntity<SpruceErrors.SpruceCli.TransportAlreadyExistsSchema>

}


export declare namespace SpruceErrors.SpruceCli {

	
	export interface ThemeExists {
		
	}

	export interface ThemeExistsSchema extends SpruceSchema.Schema {
		id: 'themeExists',
		namespace: 'SpruceCli',
		name: 'Theme exists',
		    fields: {
		    }
	}

	export type ThemeExistsEntity = SchemaEntity<SpruceErrors.SpruceCli.ThemeExistsSchema>

}


export declare namespace SpruceErrors.SpruceCli {

	
	export interface TestFailed {
		
			
			'fileName': string
			
			'testName': string
			
			'errorMessage': string
	}

	export interface TestFailedSchema extends SpruceSchema.Schema {
		id: 'testFailed',
		namespace: 'SpruceCli',
		name: 'Test failed',
		    fields: {
		            /** . */
		            'fileName': {
		                type: 'text',
		                isRequired: true,
		                options: undefined
		            },
		            /** . */
		            'testName': {
		                type: 'text',
		                isRequired: true,
		                options: undefined
		            },
		            /** . */
		            'errorMessage': {
		                type: 'text',
		                isRequired: true,
		                options: undefined
		            },
		    }
	}

	export type TestFailedEntity = SchemaEntity<SpruceErrors.SpruceCli.TestFailedSchema>

}


export declare namespace SpruceErrors.SpruceCli {

	
	export interface StoreExists {
		
	}

	export interface StoreExistsSchema extends SpruceSchema.Schema {
		id: 'storeExists',
		namespace: 'SpruceCli',
		name: 'Store exists',
		    fields: {
		    }
	}

	export type StoreExistsEntity = SchemaEntity<SpruceErrors.SpruceCli.StoreExistsSchema>

}


export declare namespace SpruceErrors.SpruceCli {

	
	export interface SkillViewExists {
		
			
			'name': string
	}

	export interface SkillViewExistsSchema extends SpruceSchema.Schema {
		id: 'skillViewExists',
		namespace: 'SpruceCli',
		name: 'Skill view exists',
		    fields: {
		            /** . */
		            'name': {
		                type: 'text',
		                isRequired: true,
		                options: undefined
		            },
		    }
	}

	export type SkillViewExistsEntity = SchemaEntity<SpruceErrors.SpruceCli.SkillViewExistsSchema>

}


export declare namespace SpruceErrors.SpruceCli {

	
	export interface SkillNotRegistered {
		
	}

	export interface SkillNotRegisteredSchema extends SpruceSchema.Schema {
		id: 'skillNotRegistered',
		namespace: 'SpruceCli',
		name: 'Skill not registered',
		    fields: {
		    }
	}

	export type SkillNotRegisteredEntity = SchemaEntity<SpruceErrors.SpruceCli.SkillNotRegisteredSchema>

}


export declare namespace SpruceErrors.SpruceCli {

	
	export interface SkillNotFound {
		
	}

	export interface SkillNotFoundSchema extends SpruceSchema.Schema {
		id: 'skillNotFound',
		namespace: 'SpruceCli',
		name: 'skill not found',
		    fields: {
		    }
	}

	export type SkillNotFoundEntity = SchemaEntity<SpruceErrors.SpruceCli.SkillNotFoundSchema>

}


export declare namespace SpruceErrors.SpruceCli {

	
	export interface SchemaTemplateItemBuildingFailed {
		
			
			'schemaId': string
			
			'schemaNamespace': string
			
			'fieldName': string
			
			'fieldOptions': (Record<string, any>)
	}

	export interface SchemaTemplateItemBuildingFailedSchema extends SpruceSchema.Schema {
		id: 'schemaTemplateItemBuildingFailed',
		namespace: 'SpruceCli',
		name: 'Schema template item building failed',
		    fields: {
		            /** . */
		            'schemaId': {
		                type: 'text',
		                isRequired: true,
		                options: undefined
		            },
		            /** . */
		            'schemaNamespace': {
		                type: 'text',
		                isRequired: true,
		                options: undefined
		            },
		            /** . */
		            'fieldName': {
		                type: 'text',
		                isRequired: true,
		                options: undefined
		            },
		            /** . */
		            'fieldOptions': {
		                type: 'raw',
		                isRequired: true,
		                options: {valueType: `Record<string, any>`,}
		            },
		    }
	}

	export type SchemaTemplateItemBuildingFailedEntity = SchemaEntity<SpruceErrors.SpruceCli.SchemaTemplateItemBuildingFailedSchema>

}


export declare namespace SpruceErrors.SpruceCli {

	/** The definition file failed to import */
	export interface SchemaFailedToImport {
		
			/** File. The file definition file I tried to import */
			'file': string
	}

	export interface SchemaFailedToImportSchema extends SpruceSchema.Schema {
		id: 'schemaFailedToImport',
		namespace: 'SpruceCli',
		name: 'Definition failed to import',
		description: 'The definition file failed to import',
		    fields: {
		            /** File. The file definition file I tried to import */
		            'file': {
		                label: 'File',
		                type: 'text',
		                isRequired: true,
		                hint: 'The file definition file I tried to import',
		                options: undefined
		            },
		    }
	}

	export type SchemaFailedToImportEntity = SchemaEntity<SpruceErrors.SpruceCli.SchemaFailedToImportSchema>

}


export declare namespace SpruceErrors.SpruceCli {

	
	export interface SchemaExists {
		
			/** Schema id. */
			'schemaId': string
			/** Destination. */
			'destination'?: string| undefined | null
	}

	export interface SchemaExistsSchema extends SpruceSchema.Schema {
		id: 'schemaExists',
		namespace: 'SpruceCli',
		name: 'Schema exists',
		    fields: {
		            /** Schema id. */
		            'schemaId': {
		                label: 'Schema id',
		                type: 'text',
		                isRequired: true,
		                options: undefined
		            },
		            /** Destination. */
		            'destination': {
		                label: 'Destination',
		                type: 'text',
		                options: undefined
		            },
		    }
	}

	export type SchemaExistsEntity = SchemaEntity<SpruceErrors.SpruceCli.SchemaExistsSchema>

}


export declare namespace SpruceErrors.SpruceCli {

	
	export interface NotLoggedIn {
		
	}

	export interface NotLoggedInSchema extends SpruceSchema.Schema {
		id: 'notLoggedIn',
		namespace: 'SpruceCli',
		name: 'Not logged in',
		    fields: {
		    }
	}

	export type NotLoggedInEntity = SchemaEntity<SpruceErrors.SpruceCli.NotLoggedInSchema>

}


export declare namespace SpruceErrors.SpruceCli {

	/** This feature has not been implemented */
	export interface NotImplemented {
		
	}

	export interface NotImplementedSchema extends SpruceSchema.Schema {
		id: 'notImplemented',
		namespace: 'SpruceCli',
		name: 'Not implemented',
		description: 'This feature has not been implemented',
		    fields: {
		    }
	}

	export type NotImplementedEntity = SchemaEntity<SpruceErrors.SpruceCli.NotImplementedSchema>

}


export declare namespace SpruceErrors.SpruceCli {

	
	export interface NoSkillsRegistered {
		
	}

	export interface NoSkillsRegisteredSchema extends SpruceSchema.Schema {
		id: 'noSkillsRegistered',
		namespace: 'SpruceCli',
		name: 'No skills registered',
		    fields: {
		    }
	}

	export type NoSkillsRegisteredEntity = SchemaEntity<SpruceErrors.SpruceCli.NoSkillsRegisteredSchema>

}


export declare namespace SpruceErrors.SpruceCli {

	
	export interface NoOrganizationsFound {
		
	}

	export interface NoOrganizationsFoundSchema extends SpruceSchema.Schema {
		id: 'noOrganizationsFound',
		namespace: 'SpruceCli',
		name: 'no organizations found',
		    fields: {
		    }
	}

	export type NoOrganizationsFoundEntity = SchemaEntity<SpruceErrors.SpruceCli.NoOrganizationsFoundSchema>

}


export declare namespace SpruceErrors.SpruceCli {

	
	export interface MissingDependenciesDependency {
		
			
			'name': string
			
			'hint': string
	}

	export interface MissingDependenciesDependencySchema extends SpruceSchema.Schema {
		id: 'missingDependenciesDependency',
		namespace: 'SpruceCli',
		name: '',
		    fields: {
		            /** . */
		            'name': {
		                type: 'text',
		                isRequired: true,
		                options: undefined
		            },
		            /** . */
		            'hint': {
		                type: 'text',
		                isRequired: true,
		                options: undefined
		            },
		    }
	}

	export type MissingDependenciesDependencyEntity = SchemaEntity<SpruceErrors.SpruceCli.MissingDependenciesDependencySchema>

}


export declare namespace SpruceErrors.SpruceCli {

	
	export interface MissingDependencies {
		
			
			'dependencies': SpruceErrors.SpruceCli.MissingDependenciesDependency[]
	}

	export interface MissingDependenciesSchema extends SpruceSchema.Schema {
		id: 'missingDependencies',
		namespace: 'SpruceCli',
		name: 'Missing dependencies',
		    fields: {
		            /** . */
		            'dependencies': {
		                type: 'schema',
		                isRequired: true,
		                isArray: true,
		                options: {schema: SpruceErrors.SpruceCli.MissingDependenciesDependencySchema,}
		            },
		    }
	}

	export type MissingDependenciesEntity = SchemaEntity<SpruceErrors.SpruceCli.MissingDependenciesSchema>

}


export declare namespace SpruceErrors.SpruceCli {

	
	export interface MercuryResponseError {
		
			
			'responseErrors': (AbstractSpruceError<any>)[]
	}

	export interface MercuryResponseErrorSchema extends SpruceSchema.Schema {
		id: 'mercuryResponseError',
		namespace: 'SpruceCli',
		name: 'Mercury response error',
		    fields: {
		            /** . */
		            'responseErrors': {
		                type: 'raw',
		                isRequired: true,
		                isArray: true,
		                options: {valueType: `AbstractSpruceError<any>`,}
		            },
		    }
	}

	export type MercuryResponseErrorEntity = SchemaEntity<SpruceErrors.SpruceCli.MercuryResponseErrorSchema>

}


export declare namespace SpruceErrors.SpruceCli {

	/** When linting a file fails */
	export interface LintFailed {
		
			/** Pattern. The pattern used to match files relative to the root of the skill */
			'pattern': string
	}

	export interface LintFailedSchema extends SpruceSchema.Schema {
		id: 'lintFailed',
		namespace: 'SpruceCli',
		name: 'Lint failed!',
		description: 'When linting a file fails',
		    fields: {
		            /** Pattern. The pattern used to match files relative to the root of the skill */
		            'pattern': {
		                label: 'Pattern',
		                type: 'text',
		                isRequired: true,
		                hint: 'The pattern used to match files relative to the root of the skill',
		                options: undefined
		            },
		    }
	}

	export type LintFailedEntity = SchemaEntity<SpruceErrors.SpruceCli.LintFailedSchema>

}


export declare namespace SpruceErrors.SpruceCli {

	
	export interface InvalidTestDirectory {
		
			
			'dir': string
	}

	export interface InvalidTestDirectorySchema extends SpruceSchema.Schema {
		id: 'invalidTestDirectory',
		namespace: 'SpruceCli',
		name: 'invalid test directory',
		    fields: {
		            /** . */
		            'dir': {
		                type: 'text',
		                isRequired: true,
		                options: undefined
		            },
		    }
	}

	export type InvalidTestDirectoryEntity = SchemaEntity<SpruceErrors.SpruceCli.InvalidTestDirectorySchema>

}


export declare namespace SpruceErrors.SpruceCli {

	
	export interface InvalidFeatureCode {
		
			
			'featureCode': string
	}

	export interface InvalidFeatureCodeSchema extends SpruceSchema.Schema {
		id: 'invalidFeatureCode',
		namespace: 'SpruceCli',
		name: 'Invalid feature code',
		    fields: {
		            /** . */
		            'featureCode': {
		                type: 'text',
		                isRequired: true,
		                options: undefined
		            },
		    }
	}

	export type InvalidFeatureCodeEntity = SchemaEntity<SpruceErrors.SpruceCli.InvalidFeatureCodeSchema>

}


export declare namespace SpruceErrors.SpruceCli {

	
	export interface InvalidEventContract {
		
			
			'fullyQualifiedEventName': string
			
			'brokenProperty': string
	}

	export interface InvalidEventContractSchema extends SpruceSchema.Schema {
		id: 'invalidEventContract',
		namespace: 'SpruceCli',
		name: 'invalid event contract',
		    fields: {
		            /** . */
		            'fullyQualifiedEventName': {
		                type: 'text',
		                isRequired: true,
		                options: undefined
		            },
		            /** . */
		            'brokenProperty': {
		                type: 'text',
		                isRequired: true,
		                options: undefined
		            },
		    }
	}

	export type InvalidEventContractEntity = SchemaEntity<SpruceErrors.SpruceCli.InvalidEventContractSchema>

}


export declare namespace SpruceErrors.SpruceCli {

	/** The command is not valid, try --help */
	export interface InvalidCommand {
		
			/** args. */
			'args': string[]
	}

	export interface InvalidCommandSchema extends SpruceSchema.Schema {
		id: 'invalidCommand',
		namespace: 'SpruceCli',
		name: 'Invalid command',
		description: 'The command is not valid, try --help',
		    fields: {
		            /** args. */
		            'args': {
		                label: 'args',
		                type: 'text',
		                isRequired: true,
		                isArray: true,
		                options: undefined
		            },
		    }
	}

	export type InvalidCommandEntity = SchemaEntity<SpruceErrors.SpruceCli.InvalidCommandSchema>

}


export declare namespace SpruceErrors.SpruceCli {

	/** When you&#x27;re too lazy to make a new error */
	export interface Generic {
		
			/** Friendly message. */
			'friendlyMessageSet'?: string| undefined | null
	}

	export interface GenericSchema extends SpruceSchema.Schema {
		id: 'generic',
		namespace: 'SpruceCli',
		name: 'generic',
		description: 'When you\'re too lazy to make a new error',
		    fields: {
		            /** Friendly message. */
		            'friendlyMessageSet': {
		                label: 'Friendly message',
		                type: 'text',
		                options: undefined
		            },
		    }
	}

	export type GenericEntity = SchemaEntity<SpruceErrors.SpruceCli.GenericSchema>

}


export declare namespace SpruceErrors.SpruceCli {

	/** The file already exists */
	export interface FileExists {
		
			/** File. The file being created */
			'file': string
	}

	export interface FileExistsSchema extends SpruceSchema.Schema {
		id: 'fileExists',
		namespace: 'SpruceCli',
		name: 'fileExists',
		description: 'The file already exists',
		    fields: {
		            /** File. The file being created */
		            'file': {
		                label: 'File',
		                type: 'text',
		                isRequired: true,
		                hint: 'The file being created',
		                options: undefined
		            },
		    }
	}

	export type FileExistsEntity = SchemaEntity<SpruceErrors.SpruceCli.FileExistsSchema>

}


export declare namespace SpruceErrors.SpruceCli {

	
	export interface FeatureNotInstalled {
		
			
			'featureCode': string
	}

	export interface FeatureNotInstalledSchema extends SpruceSchema.Schema {
		id: 'featureNotInstalled',
		namespace: 'SpruceCli',
		name: 'Feature not installed',
		    fields: {
		            /** . */
		            'featureCode': {
		                type: 'text',
		                isRequired: true,
		                options: undefined
		            },
		    }
	}

	export type FeatureNotInstalledEntity = SchemaEntity<SpruceErrors.SpruceCli.FeatureNotInstalledSchema>

}


export declare namespace SpruceErrors.SpruceCli {

	/** Failed to import a file through VM */
	export interface FailedToImport {
		
			/** File. The file I tried to import */
			'file': string
	}

	export interface FailedToImportSchema extends SpruceSchema.Schema {
		id: 'failedToImport',
		namespace: 'SpruceCli',
		name: 'FailedToImport',
		description: 'Failed to import a file through VM',
		    fields: {
		            /** File. The file I tried to import */
		            'file': {
		                label: 'File',
		                type: 'text',
		                isRequired: true,
		                hint: 'The file I tried to import',
		                options: undefined
		            },
		    }
	}

	export type FailedToImportEntity = SchemaEntity<SpruceErrors.SpruceCli.FailedToImportSchema>

}


export declare namespace SpruceErrors.SpruceCli {

	/** The command that was being executed failed */
	export interface ExecutingCommandFailed {
		
			/** The command being run. */
			'cmd'?: string| undefined | null
			/** Args. */
			'args'?: string[]| undefined | null
			/** Cwd. */
			'cwd'?: string| undefined | null
			/** Stdout. */
			'stdout'?: string| undefined | null
			/** stderr. */
			'stderr'?: string| undefined | null
	}

	export interface ExecutingCommandFailedSchema extends SpruceSchema.Schema {
		id: 'executingCommandFailed',
		namespace: 'SpruceCli',
		name: 'Executing command failed',
		description: 'The command that was being executed failed',
		    fields: {
		            /** The command being run. */
		            'cmd': {
		                label: 'The command being run',
		                type: 'text',
		                options: undefined
		            },
		            /** Args. */
		            'args': {
		                label: 'Args',
		                type: 'text',
		                isArray: true,
		                options: undefined
		            },
		            /** Cwd. */
		            'cwd': {
		                label: 'Cwd',
		                type: 'text',
		                options: undefined
		            },
		            /** Stdout. */
		            'stdout': {
		                label: 'Stdout',
		                type: 'text',
		                options: undefined
		            },
		            /** stderr. */
		            'stderr': {
		                label: 'stderr',
		                type: 'text',
		                options: undefined
		            },
		    }
	}

	export type ExecutingCommandFailedEntity = SchemaEntity<SpruceErrors.SpruceCli.ExecutingCommandFailedSchema>

}


export declare namespace SpruceErrors.SpruceCli {

	
	export interface DockerNotStarted {
		
	}

	export interface DockerNotStartedSchema extends SpruceSchema.Schema {
		id: 'dockerNotStarted',
		namespace: 'SpruceCli',
		name: 'Docker not started',
		    fields: {
		    }
	}

	export type DockerNotStartedEntity = SchemaEntity<SpruceErrors.SpruceCli.DockerNotStartedSchema>

}


export declare namespace SpruceErrors.SpruceCli {

	
	export interface DirectoryNotSkill {
		
	}

	export interface DirectoryNotSkillSchema extends SpruceSchema.Schema {
		id: 'directoryNotSkill',
		namespace: 'SpruceCli',
		name: 'Dir not skill',
		    fields: {
		    }
	}

	export type DirectoryNotSkillEntity = SchemaEntity<SpruceErrors.SpruceCli.DirectoryNotSkillSchema>

}


export declare namespace SpruceErrors.SpruceCli {

	
	export interface DirectoryEmpty {
		
			
			'directory': string
	}

	export interface DirectoryEmptySchema extends SpruceSchema.Schema {
		id: 'directoryEmpty',
		namespace: 'SpruceCli',
		name: 'directory empty',
		    fields: {
		            /** . */
		            'directory': {
		                type: 'text',
		                isRequired: true,
		                options: undefined
		            },
		    }
	}

	export type DirectoryEmptyEntity = SchemaEntity<SpruceErrors.SpruceCli.DirectoryEmptySchema>

}


export declare namespace SpruceErrors.SpruceCli {

	
	export interface DeployFailed {
		
			
			'stage': ("skill" | "building" | "testing" | "git" | "procfile" | "remote" | "heroku")
	}

	export interface DeployFailedSchema extends SpruceSchema.Schema {
		id: 'deployFailed',
		namespace: 'SpruceCli',
		name: 'Deploy Failed',
		    fields: {
		            /** . */
		            'stage': {
		                type: 'select',
		                isRequired: true,
		                options: {choices: [{"label":"Skill","value":"skill"},{"label":"Building","value":"building"},{"label":"Testing","value":"testing"},{"label":"Git","value":"git"},{"label":"Procfile","value":"procfile"},{"label":"Remote","value":"remote"},{"label":"Heroku","value":"heroku"}],}
		            },
		    }
	}

	export type DeployFailedEntity = SchemaEntity<SpruceErrors.SpruceCli.DeployFailedSchema>

}


export declare namespace SpruceErrors.SpruceCli {

	
	export interface DependencyExists {
		
			
			'namespace': string
	}

	export interface DependencyExistsSchema extends SpruceSchema.Schema {
		id: 'dependencyExists',
		namespace: 'SpruceCli',
		name: 'Dependency exists',
		    fields: {
		            /** . */
		            'namespace': {
		                type: 'text',
		                isRequired: true,
		                options: undefined
		            },
		    }
	}

	export type DependencyExistsEntity = SchemaEntity<SpruceErrors.SpruceCli.DependencyExistsSchema>

}


export declare namespace SpruceErrors.SpruceCli {

	/** Autoloader creation failed */
	export interface CreateAutoloaderFailed {
		
			/** The globby pattern used to find files. Globby pattern */
			'globbyPattern': string
			/** The files that were loaded. The files that were loaded */
			'filePaths': string[]
			/** The suffix for classes to autoload. Class suffix */
			'suffix': string
			/** The directory we're trying to create the autoloader for. Directory to autoload */
			'directory': string
	}

	export interface CreateAutoloaderFailedSchema extends SpruceSchema.Schema {
		id: 'createAutoloaderFailed',
		namespace: 'SpruceCli',
		name: 'Could not create an autoloader',
		description: 'Autoloader creation failed',
		    fields: {
		            /** The globby pattern used to find files. Globby pattern */
		            'globbyPattern': {
		                label: 'The globby pattern used to find files',
		                type: 'text',
		                isRequired: true,
		                hint: 'Globby pattern',
		                options: undefined
		            },
		            /** The files that were loaded. The files that were loaded */
		            'filePaths': {
		                label: 'The files that were loaded',
		                type: 'text',
		                isRequired: true,
		                hint: 'The files that were loaded',
		                isArray: true,
		                options: undefined
		            },
		            /** The suffix for classes to autoload. Class suffix */
		            'suffix': {
		                label: 'The suffix for classes to autoload',
		                type: 'text',
		                isRequired: true,
		                hint: 'Class suffix',
		                options: undefined
		            },
		            /** The directory we're trying to create the autoloader for. Directory to autoload */
		            'directory': {
		                label: 'The directory we\'re trying to create the autoloader for',
		                type: 'text',
		                isRequired: true,
		                hint: 'Directory to autoload',
		                options: undefined
		            },
		    }
	}

	export type CreateAutoloaderFailedEntity = SchemaEntity<SpruceErrors.SpruceCli.CreateAutoloaderFailedSchema>

}


export declare namespace SpruceErrors.SpruceCli {

	/** This command has not yet been implemented  */
	export interface CommandNotImplemented {
		
			/** Command. the command being run! */
			'command': string
			/** Args. Arguments passed to the command */
			'args'?: string[]| undefined | null
	}

	export interface CommandNotImplementedSchema extends SpruceSchema.Schema {
		id: 'commandNotImplemented',
		namespace: 'SpruceCli',
		name: 'Command not implemented',
		description: 'This command has not yet been implemented ',
		    fields: {
		            /** Command. the command being run! */
		            'command': {
		                label: 'Command',
		                type: 'text',
		                isRequired: true,
		                hint: 'the command being run!',
		                options: undefined
		            },
		            /** Args. Arguments passed to the command */
		            'args': {
		                label: 'Args',
		                type: 'text',
		                hint: 'Arguments passed to the command',
		                isArray: true,
		                options: undefined
		            },
		    }
	}

	export type CommandNotImplementedEntity = SchemaEntity<SpruceErrors.SpruceCli.CommandNotImplementedSchema>

}


export declare namespace SpruceErrors.SpruceCli {

	
	export interface CommandBlocked {
		
			
			'command': string
			
			'hint': string
	}

	export interface CommandBlockedSchema extends SpruceSchema.Schema {
		id: 'commandBlocked',
		namespace: 'SpruceCli',
		name: 'Command blocked',
		    fields: {
		            /** . */
		            'command': {
		                type: 'text',
		                isRequired: true,
		                options: undefined
		            },
		            /** . */
		            'hint': {
		                type: 'text',
		                isRequired: true,
		                options: undefined
		            },
		    }
	}

	export type CommandBlockedEntity = SchemaEntity<SpruceErrors.SpruceCli.CommandBlockedSchema>

}


export declare namespace SpruceErrors.SpruceCli {

	
	export interface CommandAborted {
		
			/** Command. */
			'command': string
	}

	export interface CommandAbortedSchema extends SpruceSchema.Schema {
		id: 'commandAborted',
		namespace: 'SpruceCli',
		name: 'Command aborted',
		    fields: {
		            /** Command. */
		            'command': {
		                label: 'Command',
		                type: 'text',
		                isRequired: true,
		                options: undefined
		            },
		    }
	}

	export type CommandAbortedEntity = SchemaEntity<SpruceErrors.SpruceCli.CommandAbortedSchema>

}


export declare namespace SpruceErrors.SpruceCli {

	
	export interface CannotPromptInCi {
		
	}

	export interface CannotPromptInCiSchema extends SpruceSchema.Schema {
		id: 'cannotPromptInCi',
		namespace: 'SpruceCli',
		name: 'cannot prompt in ci',
		    fields: {
		    }
	}

	export type CannotPromptInCiEntity = SchemaEntity<SpruceErrors.SpruceCli.CannotPromptInCiSchema>

}


export declare namespace SpruceErrors.SpruceCli {

	
	export interface CacheNotEnabled {
		
	}

	export interface CacheNotEnabledSchema extends SpruceSchema.Schema {
		id: 'cacheNotEnabled',
		namespace: 'SpruceCli',
		name: 'Cache not enabled',
		    fields: {
		    }
	}

	export type CacheNotEnabledEntity = SchemaEntity<SpruceErrors.SpruceCli.CacheNotEnabledSchema>

}


export declare namespace SpruceErrors.SpruceCli {

	/** Error thrown when building or linting failed. Happens when a yarn command fails inside the package utility. */
	export interface BuildFailed {
		
			/** File. File we wanted to build, if not set we wanted to build everything.. */
			'file'?: string| undefined | null
	}

	export interface BuildFailedSchema extends SpruceSchema.Schema {
		id: 'buildFailed',
		namespace: 'SpruceCli',
		name: 'BuildFailed',
		description: 'Error thrown when building or linting failed. Happens when a yarn command fails inside the package utility.',
		    fields: {
		            /** File. File we wanted to build, if not set we wanted to build everything.. */
		            'file': {
		                label: 'File',
		                type: 'text',
		                hint: 'File we wanted to build, if not set we wanted to build everything..',
		                options: undefined
		            },
		    }
	}

	export type BuildFailedEntity = SchemaEntity<SpruceErrors.SpruceCli.BuildFailedSchema>

}


export declare namespace SpruceErrors.SpruceCli {

	
	export interface BootError {
		
	}

	export interface BootErrorSchema extends SpruceSchema.Schema {
		id: 'bootError',
		namespace: 'SpruceCli',
		name: 'boot error',
		    fields: {
		    }
	}

	export type BootErrorEntity = SchemaEntity<SpruceErrors.SpruceCli.BootErrorSchema>

}


export declare namespace SpruceErrors.SpruceCli {

	
	export interface AppControllerAlreadyExists {
		
	}

	export interface AppControllerAlreadyExistsSchema extends SpruceSchema.Schema {
		id: 'appControllerAlreadyExists',
		namespace: 'SpruceCli',
		name: 'App view controller already exists',
		    fields: {
		    }
	}

	export type AppControllerAlreadyExistsEntity = SchemaEntity<SpruceErrors.SpruceCli.AppControllerAlreadyExistsSchema>

}


export declare namespace SpruceErrors.SpruceCli {

	
	export interface ActionCancelled {
		
	}

	export interface ActionCancelledSchema extends SpruceSchema.Schema {
		id: 'actionCancelled',
		namespace: 'SpruceCli',
		name: 'Action cancelled',
		    fields: {
		    }
	}

	export type ActionCancelledEntity = SchemaEntity<SpruceErrors.SpruceCli.ActionCancelledSchema>

}




