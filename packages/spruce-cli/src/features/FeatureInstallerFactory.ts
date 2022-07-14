import { templates } from '@sprucelabs/spruce-templates'
import { GlobalEmitter } from '../GlobalEmitter'
import ServiceFactory from '../services/ServiceFactory'
import StoreFactory from '../stores/StoreFactory'
import { ApiClientFactory } from '../types/apiClient.types'
import { GraphicsInterface } from '../types/cli.types'
import { FeatureOptions } from './AbstractFeature'
import ActionExecuter from './ActionExecuter'
import CacheFeature from './cache/CacheFeature'
import ConversationFeature from './conversation/ConversationFeature'
import DependencyFeature from './dependencies/DependencyFeature'
import DeployFeature from './deploy/DeployFeature'
import ErrorFeature from './error/ErrorFeature'
import EventFeature from './event/EventFeature'
import EventContractFeature from './eventContract/EventContractFeature'
import FeatureInstaller from './FeatureInstaller'
import { FeatureCode } from './features.types'
import LogFeature from './log/LogFeature'
import NodeFeature from './node/NodeFeature'
import OnboardFeature from './onboard/OnboardFeature'
import OrganizationFeature from './organization/OrganizationFeature'
import PermissionFeature from './permission/PermissionFeature'
import PersonFeature from './person/PersonFeature'
import PolishFeature from './polish/PolishFeature'
import SandboxFeature from './sandbox/SandboxFeature'
import SchemaFeature from './schema/SchemaFeature'
import SkillFeature from './skill/SkillFeature'
import StoreFeature from './store/StoreFeature'
import TestFeature from './test/TestFeature'
import ViewFeature from './view/ViewFeature'
import VsCodeFeature from './vscode/VsCodeFeature'
import WatchFeature from './watch/WatchFeature'
export default class FeatureInstallerFactory {
	private static readonly features: any[] = [
		ErrorFeature,
		SchemaFeature,
		SkillFeature,
		TestFeature,
		VsCodeFeature,
		EventFeature,
		WatchFeature,
		NodeFeature,
		OnboardFeature,
		PersonFeature,
		OrganizationFeature,
		ConversationFeature,
		EventContractFeature,
		DeployFeature,
		SandboxFeature,
		StoreFeature,
		ViewFeature,
		CacheFeature,
		LogFeature,
		DependencyFeature,
		PolishFeature,
		PermissionFeature,
	]

	public static readonly featureCodes: FeatureCode[] = [
		'error',
		'schema',
		'skill',
		'test',
		'vscode',
		'event',
		'watch',
		'node',
		'onboard',
		'person',
		'organization',
		'conversation',
		'eventContract',
		'deploy',
		'sandbox',
		'store',
		'view',
		'cache',
		'log',
		'dependency',
		'polish',
		'permission',
	]

	public static WithAllFeatures(options: {
		cwd: string
		serviceFactory: ServiceFactory
		storeFactory: StoreFactory
		featureInstaller?: FeatureInstaller
		ui: GraphicsInterface
		emitter: GlobalEmitter
		apiClientFactory: ApiClientFactory
		actionExecuter: ActionExecuter
	}): FeatureInstaller {
		const { cwd, serviceFactory, storeFactory, ui, emitter, actionExecuter } =
			options

		const featureInstaller =
			options.featureInstaller ?? new FeatureInstaller(cwd, serviceFactory)

		const featureOptions: FeatureOptions = {
			cwd,
			serviceFactory,
			templates,
			storeFactory,
			featureInstaller,
			ui,
			emitter,
			actionExecuter,
			apiClientFactory: options.apiClientFactory,
		}

		this.features.forEach((Feature) => {
			const feature = new Feature(featureOptions)

			featureInstaller.mapFeature(feature.code, feature)
		})

		return featureInstaller
	}
}
