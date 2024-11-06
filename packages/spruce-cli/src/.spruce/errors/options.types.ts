import { SpruceErrors } from "#spruce/errors/errors.types"
import { ErrorOptions as ISpruceErrorOptions} from "@sprucelabs/error"

export interface VscodeNotInstalledErrorOptions extends SpruceErrors.SpruceCli.VscodeNotInstalled, ISpruceErrorOptions {
	code: 'VSCODE_NOT_INSTALLED'
}
export interface ViewPluginAlreadyExistsErrorOptions extends SpruceErrors.SpruceCli.ViewPluginAlreadyExists, ISpruceErrorOptions {
	code: 'VIEW_PLUGIN_ALREADY_EXISTS'
}
export interface TransportAlreadyExistsErrorOptions extends SpruceErrors.SpruceCli.TransportAlreadyExists, ISpruceErrorOptions {
	code: 'TRANSPORT_ALREADY_EXISTS'
}
export interface ThemeExistsErrorOptions extends SpruceErrors.SpruceCli.ThemeExists, ISpruceErrorOptions {
	code: 'THEME_EXISTS'
}
export interface TestFailedErrorOptions extends SpruceErrors.SpruceCli.TestFailed, ISpruceErrorOptions {
	code: 'TEST_FAILED'
}
export interface StoreExistsErrorOptions extends SpruceErrors.SpruceCli.StoreExists, ISpruceErrorOptions {
	code: 'STORE_EXISTS'
}
export interface SkillViewExistsErrorOptions extends SpruceErrors.SpruceCli.SkillViewExists, ISpruceErrorOptions {
	code: 'SKILL_VIEW_EXISTS'
}
export interface SkillNotRegisteredErrorOptions extends SpruceErrors.SpruceCli.SkillNotRegistered, ISpruceErrorOptions {
	code: 'SKILL_NOT_REGISTERED'
}
export interface SkillNotFoundErrorOptions extends SpruceErrors.SpruceCli.SkillNotFound, ISpruceErrorOptions {
	code: 'SKILL_NOT_FOUND'
}
export interface SchemaTemplateItemBuildingFailedErrorOptions extends SpruceErrors.SpruceCli.SchemaTemplateItemBuildingFailed, ISpruceErrorOptions {
	code: 'SCHEMA_TEMPLATE_ITEM_BUILDING_FAILED'
}
export interface SchemaFailedToImportErrorOptions extends SpruceErrors.SpruceCli.SchemaFailedToImport, ISpruceErrorOptions {
	code: 'SCHEMA_FAILED_TO_IMPORT'
}
export interface SchemaExistsErrorOptions extends SpruceErrors.SpruceCli.SchemaExists, ISpruceErrorOptions {
	code: 'SCHEMA_EXISTS'
}
export interface NotLoggedInErrorOptions extends SpruceErrors.SpruceCli.NotLoggedIn, ISpruceErrorOptions {
	code: 'NOT_LOGGED_IN'
}
export interface NotImplementedErrorOptions extends SpruceErrors.SpruceCli.NotImplemented, ISpruceErrorOptions {
	code: 'NOT_IMPLEMENTED'
}
export interface NoSkillsRegisteredErrorOptions extends SpruceErrors.SpruceCli.NoSkillsRegistered, ISpruceErrorOptions {
	code: 'NO_SKILLS_REGISTERED'
}
export interface NoOrganizationsFoundErrorOptions extends SpruceErrors.SpruceCli.NoOrganizationsFound, ISpruceErrorOptions {
	code: 'NO_ORGANIZATIONS_FOUND'
}
export interface MissingDependenciesErrorOptions extends SpruceErrors.SpruceCli.MissingDependencies, ISpruceErrorOptions {
	code: 'MISSING_DEPENDENCIES'
}
export interface MercuryResponseErrorErrorOptions extends SpruceErrors.SpruceCli.MercuryResponseError, ISpruceErrorOptions {
	code: 'MERCURY_RESPONSE_ERROR'
}
export interface LintFailedErrorOptions extends SpruceErrors.SpruceCli.LintFailed, ISpruceErrorOptions {
	code: 'LINT_FAILED'
}
export interface InvalidTestDirectoryErrorOptions extends SpruceErrors.SpruceCli.InvalidTestDirectory, ISpruceErrorOptions {
	code: 'INVALID_TEST_DIRECTORY'
}
export interface InvalidFeatureCodeErrorOptions extends SpruceErrors.SpruceCli.InvalidFeatureCode, ISpruceErrorOptions {
	code: 'INVALID_FEATURE_CODE'
}
export interface InvalidEventContractErrorOptions extends SpruceErrors.SpruceCli.InvalidEventContract, ISpruceErrorOptions {
	code: 'INVALID_EVENT_CONTRACT'
}
export interface InvalidCommandErrorOptions extends SpruceErrors.SpruceCli.InvalidCommand, ISpruceErrorOptions {
	code: 'INVALID_COMMAND'
}
export interface GenericErrorOptions extends SpruceErrors.SpruceCli.Generic, ISpruceErrorOptions {
	code: 'GENERIC'
}
export interface FileExistsErrorOptions extends SpruceErrors.SpruceCli.FileExists, ISpruceErrorOptions {
	code: 'FILE_EXISTS'
}
export interface FeatureNotInstalledErrorOptions extends SpruceErrors.SpruceCli.FeatureNotInstalled, ISpruceErrorOptions {
	code: 'FEATURE_NOT_INSTALLED'
}
export interface FailedToImportErrorOptions extends SpruceErrors.SpruceCli.FailedToImport, ISpruceErrorOptions {
	code: 'FAILED_TO_IMPORT'
}
export interface ExecutingCommandFailedErrorOptions extends SpruceErrors.SpruceCli.ExecutingCommandFailed, ISpruceErrorOptions {
	code: 'EXECUTING_COMMAND_FAILED'
}
export interface DockerNotStartedErrorOptions extends SpruceErrors.SpruceCli.DockerNotStarted, ISpruceErrorOptions {
	code: 'DOCKER_NOT_STARTED'
}
export interface DirectoryNotSkillErrorOptions extends SpruceErrors.SpruceCli.DirectoryNotSkill, ISpruceErrorOptions {
	code: 'DIRECTORY_NOT_SKILL'
}
export interface DirectoryEmptyErrorOptions extends SpruceErrors.SpruceCli.DirectoryEmpty, ISpruceErrorOptions {
	code: 'DIRECTORY_EMPTY'
}
export interface DeployFailedErrorOptions extends SpruceErrors.SpruceCli.DeployFailed, ISpruceErrorOptions {
	code: 'DEPLOY_FAILED'
}
export interface DependencyExistsErrorOptions extends SpruceErrors.SpruceCli.DependencyExists, ISpruceErrorOptions {
	code: 'DEPENDENCY_EXISTS'
}
export interface CreateAutoloaderFailedErrorOptions extends SpruceErrors.SpruceCli.CreateAutoloaderFailed, ISpruceErrorOptions {
	code: 'CREATE_AUTOLOADER_FAILED'
}
export interface CommandNotImplementedErrorOptions extends SpruceErrors.SpruceCli.CommandNotImplemented, ISpruceErrorOptions {
	code: 'COMMAND_NOT_IMPLEMENTED'
}
export interface CommandBlockedErrorOptions extends SpruceErrors.SpruceCli.CommandBlocked, ISpruceErrorOptions {
	code: 'COMMAND_BLOCKED'
}
export interface CommandAbortedErrorOptions extends SpruceErrors.SpruceCli.CommandAborted, ISpruceErrorOptions {
	code: 'COMMAND_ABORTED'
}
export interface CannotPromptInCiErrorOptions extends SpruceErrors.SpruceCli.CannotPromptInCi, ISpruceErrorOptions {
	code: 'CANNOT_PROMPT_IN_CI'
}
export interface CacheNotEnabledErrorOptions extends SpruceErrors.SpruceCli.CacheNotEnabled, ISpruceErrorOptions {
	code: 'CACHE_NOT_ENABLED'
}
export interface BuildFailedErrorOptions extends SpruceErrors.SpruceCli.BuildFailed, ISpruceErrorOptions {
	code: 'BUILD_FAILED'
}
export interface BootErrorErrorOptions extends SpruceErrors.SpruceCli.BootError, ISpruceErrorOptions {
	code: 'BOOT_ERROR'
}
export interface AppViewControllerAlreadyExistsErrorOptions extends SpruceErrors.SpruceCli.AppViewControllerAlreadyExists, ISpruceErrorOptions {
	code: 'APP_VIEW_CONTROLLER_ALREADY_EXISTS'
}
export interface ActionCancelledErrorOptions extends SpruceErrors.SpruceCli.ActionCancelled, ISpruceErrorOptions {
	code: 'ACTION_CANCELLED'
}

type ErrorOptions =  | VscodeNotInstalledErrorOptions  | ViewPluginAlreadyExistsErrorOptions  | TransportAlreadyExistsErrorOptions  | ThemeExistsErrorOptions  | TestFailedErrorOptions  | StoreExistsErrorOptions  | SkillViewExistsErrorOptions  | SkillNotRegisteredErrorOptions  | SkillNotFoundErrorOptions  | SchemaTemplateItemBuildingFailedErrorOptions  | SchemaFailedToImportErrorOptions  | SchemaExistsErrorOptions  | NotLoggedInErrorOptions  | NotImplementedErrorOptions  | NoSkillsRegisteredErrorOptions  | NoOrganizationsFoundErrorOptions  | MissingDependenciesErrorOptions  | MercuryResponseErrorErrorOptions  | LintFailedErrorOptions  | InvalidTestDirectoryErrorOptions  | InvalidFeatureCodeErrorOptions  | InvalidEventContractErrorOptions  | InvalidCommandErrorOptions  | GenericErrorOptions  | FileExistsErrorOptions  | FeatureNotInstalledErrorOptions  | FailedToImportErrorOptions  | ExecutingCommandFailedErrorOptions  | DockerNotStartedErrorOptions  | DirectoryNotSkillErrorOptions  | DirectoryEmptyErrorOptions  | DeployFailedErrorOptions  | DependencyExistsErrorOptions  | CreateAutoloaderFailedErrorOptions  | CommandNotImplementedErrorOptions  | CommandBlockedErrorOptions  | CommandAbortedErrorOptions  | CannotPromptInCiErrorOptions  | CacheNotEnabledErrorOptions  | BuildFailedErrorOptions  | BootErrorErrorOptions  | AppViewControllerAlreadyExistsErrorOptions  | ActionCancelledErrorOptions 

export default ErrorOptions
