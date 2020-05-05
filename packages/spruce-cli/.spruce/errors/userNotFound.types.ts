// the options for the UserNotFound error

import {
	SchemaDefinitionValues
} from '@sprucelabs/schema'

import userNotFoundDefinition from '../../src/errors/userNotFound.definition'
import { ISpruceErrorOptions } from '@sprucelabs/error'
import { ErrorCode } from './codes.types'

type UserNotFoundDefinition = typeof userNotFoundDefinition
export interface IUserNotFoundDefinition extends UserNotFoundDefinition {}

export interface IUserNotFoundErrorOptions extends SchemaDefinitionValues<IUserNotFoundDefinition>, ISpruceErrorOptions<ErrorCode> {
	/** * .UserNotFound - Could not find a user */
	code: ErrorCode.UserNotFound
} 

