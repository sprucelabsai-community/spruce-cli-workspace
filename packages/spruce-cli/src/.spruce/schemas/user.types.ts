import Schema, {
	SchemaDefinitionValues
} from '@sprucelabs/schema'

import userDefinition from '../../schemas/user.definition'

type UserDefinition = typeof userDefinition
export interface IUserDefinition extends UserDefinition {}

A stripped down user for the cli
export interface IUser extends SchemaDefinitionValues<IUserDefinition> {}
export interface IUserInstance extends Schema<IUserDefinition> {}
