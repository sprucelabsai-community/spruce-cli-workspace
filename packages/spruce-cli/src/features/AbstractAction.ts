import { Schema, SchemaValues, SchemaPartialValues } from '@sprucelabs/schema'
import { versionUtil } from '@sprucelabs/spruce-skill-utils'
import { Templates } from '@sprucelabs/spruce-templates'
import { GlobalEmitter } from '../GlobalEmitter'
import ServiceFactory, {
	ServiceProvider,
	Service,
	ServiceMap,
} from '../services/ServiceFactory'
import StoreFactory, {
	StoreCode,
	CreateStoreOptions,
	StoreMap,
} from '../stores/StoreFactory'
import {
	ApiClient,
	ApiClientFactory,
	ApiClientFactoryOptions,
} from '../types/apiClient.types'
import { GraphicsInterface } from '../types/cli.types'
import { WriterOptions } from '../writers/AbstractWriter'
import WriterFactory, { WriterCode, WriterMap } from '../writers/WriterFactory'
import AbstractFeature from './AbstractFeature'
import ActionExecuter from './ActionExecuter'
import FeatureInstaller from './FeatureInstaller'
import {
	FeatureAction,
	FeatureActionResponse,
	ActionOptions,
	FeatureCode,
} from './features.types'
import validateAndNormalizer from './validateAndNormalize.utility'

export default abstract class AbstractAction<S extends Schema = Schema>
	implements FeatureAction<S>, ServiceProvider
{
	public abstract optionsSchema: S
	public readonly commandAliases: string[] = []
	public abstract invocationMessage: string

	protected parent: AbstractFeature
	protected features: FeatureInstaller
	protected cwd: string
	protected templates: Templates
	protected ui: GraphicsInterface
	protected emitter: GlobalEmitter

	private serviceFactory: ServiceFactory
	private storeFactory: StoreFactory
	private writerFactory: WriterFactory
	private apiClientFactory: ApiClientFactory
	private actionExecuter: ActionExecuter

	public constructor(options: ActionOptions) {
		this.cwd = options.cwd
		this.templates = options.templates
		this.parent = options.parent
		this.storeFactory = options.storeFactory
		this.serviceFactory = options.serviceFactory
		this.features = options.featureInstaller
		this.ui = options.ui
		this.writerFactory = options.writerFactory
		this.apiClientFactory = options.apiClientFactory
		this.emitter = options.emitter
		this.actionExecuter = options.actionExecuter
	}

	public abstract execute(
		options: SchemaValues<S>
	): Promise<FeatureActionResponse>

	protected Action(featureCode: FeatureCode, actionCode: string) {
		return this.actionExecuter.Action(featureCode, actionCode)
	}

	public Service<S extends Service>(type: S, cwd?: string): ServiceMap[S] {
		return this.serviceFactory.Service(cwd ?? this.cwd, type)
	}

	protected Store<C extends StoreCode>(
		code: C,
		options?: CreateStoreOptions<C>
	): StoreMap[C] {
		return this.storeFactory.Store(code, { cwd: this.cwd, ...(options as any) })
	}

	protected Writer<C extends WriterCode>(
		code: C,
		options?: Partial<WriterOptions>
	): WriterMap[C] {
		return this.writerFactory.Writer(code, {
			fileDescriptions: this.parent.fileDescriptions,
			linter: this.Service('lint'),
			...options,
		})
	}

	protected getFeature<C extends FeatureCode>(code: C) {
		return this.features.getFeature(code)
	}

	protected getFeatureCodes(): FeatureCode[] {
		return this.features.getAllCodes()
	}

	protected validateAndNormalizeOptions(options: SchemaPartialValues<S>) {
		const schema = this.optionsSchema
		return validateAndNormalizer.validateAndNormalize(schema, options)
	}

	protected async resolveVersion(
		userSuppliedVersion: string | null | undefined,
		resolvedDestination: string
	) {
		let resolvedVersion = versionUtil.generateVersion(
			userSuppliedVersion ?? undefined
		).constValue

		if (!userSuppliedVersion) {
			resolvedVersion = await this.askForVersionIfTodaysVersionDoesNotExist(
				resolvedDestination,
				resolvedVersion
			)
		}
		versionUtil.assertValidVersion(resolvedVersion)

		return versionUtil.generateVersion(resolvedVersion).dirValue
	}

	private async askForVersionIfTodaysVersionDoesNotExist(
		resolvedDestination: string,
		fallbackVersion: string
	) {
		const versions = versionUtil.getAllVersions(resolvedDestination)
		const todaysVersion = versionUtil.generateVersion()

		let version = fallbackVersion
		const alreadyHasToday = !!versions.find(
			(version) => version.dirValue === todaysVersion.dirValue
		)
		const choices = []

		if (!alreadyHasToday) {
			choices.push({
				label: 'New Version',
				value: todaysVersion.dirValue,
			})
		}

		choices.push(
			...versions
				.sort((a, b) => {
					return a.intValue > b.intValue ? -1 : 1
				})
				.map((version) => ({
					value: version.dirValue,
					label: version.dirValue,
				}))
		)

		if (versions.length > 0) {
			version = await this.ui.prompt({
				type: 'select',
				label: 'Version',
				hint: 'Confirm which version you want to use?',
				isRequired: true,
				options: {
					choices,
				},
			})
		}
		return version
	}

	protected async connectToApi(
		options?: ApiClientFactoryOptions
	): Promise<ApiClient> {
		return this.apiClientFactory(options)
	}
}
