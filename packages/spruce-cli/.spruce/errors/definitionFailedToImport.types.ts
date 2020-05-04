// the options for the DefinitionFailedToImport error

import { SchemaDefinitionValues } from '@sprucelabs/schema'

import definitionFailedToImportDefinition from '../../src/errors/definitionFailedToImport.definition'
import { ISpruceErrorOptions } from '@sprucelabs/error'
import { ErrorCode } from './codes.types'

type DefinitionFailedToImportDefinition = typeof definitionFailedToImportDefinition
export interface IDefinitionFailedToImportDefinition
	extends DefinitionFailedToImportDefinition {}

export interface IDefinitionFailedToImportErrorOptions
	extends SchemaDefinitionValues<IDefinitionFailedToImportDefinition>,
		ISpruceErrorOptions<ErrorCode> {
	/** * .DefinitionFailedToImport - The definition file failed to import */
	code: ErrorCode.DefinitionFailedToImport
}
