/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable no-redeclare */

import { default as SchemaEntity } from '@sprucelabs/schema'
import * as SpruceSchema from '@sprucelabs/schema'




import AbstractSpruceError from '@sprucelabs/error'

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

	/** Could not find a user */
	export interface UserNotFound {
		
			/** Token. */
			'token'?: string| undefined | null
			/** User id. */
			'userId'?: number| undefined | null
	}

	export interface UserNotFoundSchema extends SpruceSchema.Schema {
		id: 'userNotFound',
		namespace: 'SpruceCli',
		name: 'User not found',
		description: 'Could not find a user',
		    fields: {
		            /** Token. */
		            'token': {
		                label: 'Token',
		                type: 'text',
		                options: undefined
		            },
		            /** User id. */
		            'userId': {
		                label: 'User id',
		                type: 'number',
		                options: undefined
		            },
		    }
	}

	export type UserNotFoundEntity = SchemaEntity<SpruceErrors.SpruceCli.UserNotFoundSchema>

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

	/** When linting a file fails */
	export interface LintFailed {
		
			/** Pattern. The pattern used to match files relative to the root of the skill */
			'pattern': string
			/** Output from lint. */
			'stdout': string
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
		            /** Output from lint. */
		            'stdout': {
		                label: 'Output from lint',
		                type: 'text',
		                isRequired: true,
		                options: undefined
		            },
		    }
	}

	export type LintFailedEntity = SchemaEntity<SpruceErrors.SpruceCli.LintFailedSchema>

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
			'cmd': string
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
		                isRequired: true,
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

	/** Booting your skill failed! */
	export interface BootFailed {
		
	}

	export interface BootFailedSchema extends SpruceSchema.Schema {
		id: 'bootFailed',
		namespace: 'SpruceCli',
		name: 'Boot failed',
		description: 'Booting your skill failed!',
		    fields: {
		    }
	}

	export type BootFailedEntity = SchemaEntity<SpruceErrors.SpruceCli.BootFailedSchema>

}




