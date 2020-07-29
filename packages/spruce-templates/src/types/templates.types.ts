import { ISchemaTemplateItem } from '@sprucelabs/schema'

export interface IAutoLoaderClassTemplateItem {
	optionsInterfaceName?: string
	className: string
	nameCamel: string
	namePascal: string
	relativeFilePath: string
}

export interface IAutoLoaderInterfaceTemplateItem {
	interfaceName: string
	relativeFilePath: string
}

export interface IAutoLoaderImportTemplateItem {
	name: string
	filePath: string
}

export interface IAutoLoaderTemplateItem {
	abstractClassName: string
	abstractClassRelativePath: string
	abstractClassOptionsInterfaceName?: string
	classes: IAutoLoaderClassTemplateItem[]
	interfaces: IAutoLoaderInterfaceTemplateItem[]
	constructorOptionInterfaces: IAutoLoaderImportTemplateItem[]
	namePascalPlural: string
	namePascal: string
	nameCamel: string
	nameCamelPlural: string
}

export interface IRootAutoloaderTemplateItem {
	autoloaders: IAutoLoaderTemplateItem[]
}

export enum DirectoryTemplateKind {
	Skill = 'skill',
	VsCode = 'vscode',
	CircleCi = 'circleci',
	Autoloadable = 'autoloadable',
}

export interface IDirectoryTemplateContextSkill {
	name: string
	description: string
}
export interface IDirectoryTemplateContextVsCode {}
export interface IDirectoryTemplateContextCircleCi {}
export interface IDirectoryTemplateContextAutoloadable {
	namePascalPlural: string
	namePascal: string
	nameCamelPlural: string
}

export interface IDirectoryTemplateContextMap {
	[DirectoryTemplateKind.Skill]: IDirectoryTemplateContextSkill
	[DirectoryTemplateKind.VsCode]: IDirectoryTemplateContextVsCode
	[DirectoryTemplateKind.CircleCi]: IDirectoryTemplateContextCircleCi
	[DirectoryTemplateKind.Autoloadable]: IDirectoryTemplateContextAutoloadable
}

export interface IDirectoryTemplateFile {
	/** The relative path of the output file, without a leading forward slash */
	relativePath: string
	/** The file contents, built with the template data */
	contents: string
}

export interface ISchemaBuilderTemplateItem {
	nameCamel: string
	description?: string | null
	namePascal: string
	nameReadable: string
	builderFunction?: string
}

export interface IErrorOptions {
	errors: IErrorTemplateItem[]
	renderClassDefinition?: boolean
}

export interface IErrorTemplateItem extends ISchemaTemplateItem {
	code: string
}

export interface IValueTypes {
	[namespace: string]: {
		[schemaId: string]: {
			[version: string]: {
				[fieldName: string]: {
					valueTypes: {
						value: string
						type: string
						schemaType: string
					}
					valueTypeGeneratorType?: string
				}
			}
		}
	}
}
