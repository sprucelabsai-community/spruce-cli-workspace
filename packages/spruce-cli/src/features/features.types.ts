import { SpruceSchemas } from '@sprucelabs/mercury-types'
import { Schema, SchemaValues } from '@sprucelabs/schema'
import { Templates } from '@sprucelabs/spruce-templates'
import { GlobalEmitter } from '../GlobalEmitter'
import ServiceFactory from '../services/ServiceFactory'
import StoreFactory from '../stores/StoreFactory'
import { ApiClientFactory } from '../types/apiClient.types'
import {
	GeneratedFile,
	NpmPackage,
	InternalUpdateHandler,
} from '../types/cli.types'
import { GraphicsInterface } from '../types/cli.types'
import WriterFactory from '../writers/WriterFactory'
import AbstractFeature from './AbstractFeature'
import ActionExecuter from './ActionExecuter'
import FeatureInstaller from './FeatureInstaller'

export interface FeatureMap {}
export interface FeatureOptionsMap {}

export type InstallFeature<
	Keys extends keyof FeatureOptionsMap = keyof FeatureOptionsMap,
> = {
	[Key in Keys]: Omit<
		{
			code: Key
			options: FeatureOptionsMap[Key]
		},
		FeatureOptionsMap[Key] extends Record<string, any> ? never : 'options'
	>
}[Keys]

export interface ActionOptions {
	templates: Templates
	serviceFactory: ServiceFactory
	cwd: string
	parent: AbstractFeature
	storeFactory: StoreFactory
	featureInstaller: FeatureInstaller
	ui: GraphicsInterface
	writerFactory: WriterFactory
	emitter: GlobalEmitter
	actionExecuter: ActionExecuter
	apiClientFactory: ApiClientFactory
}

export type FeatureCode = keyof FeatureMap

export type FeatureExecuteOptions<F extends FeatureCode> =
	FeatureMap[F]['optionsSchema'] extends Schema
		? SchemaValues<FeatureMap[F]['optionsSchema']>
		: undefined

export interface InstallFeatureOptions {
	features: InstallFeature[]
	installFeatureDependencies?: boolean
	didUpdateHandler?: InternalUpdateHandler
}

export interface FeatureInstallResponse {
	files?: GeneratedFile[]
	packagesInstalled?: NpmPackage[]
}

export type FeatureActionResponse =
	SpruceSchemas.SpruceCli.v2020_07_22.ActionResponse & FeatureInstallResponse

export interface FeatureAction<S extends Schema = Schema> {
	optionsSchema?: S
	commandAliases: string[]
	invocationMessage: string
	execute: (options: SchemaValues<S>) => Promise<FeatureActionResponse>
}
