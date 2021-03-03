import { templates } from '@sprucelabs/spruce-templates'
import { GlobalEmitter } from '../GlobalEmitter'
import ServiceFactory from '../services/ServiceFactory'
import StoreFactory from '../stores/StoreFactory'
import { ApiClientFactory } from '../types/apiClient.types'
import { GraphicsInterface } from '../types/cli.types'
import { FeatureOptions } from './AbstractFeature'
import ConversationFeature from './conversation/ConversationFeature'
import DeployFeature from './deploy/DeployFeature'
import ErrorFeature from './error/ErrorFeature'
import EventFeature from './event/EventFeature'
import EventContractFeature from './eventContract/EventContractFeature'
import FeatureInstaller from './FeatureInstaller'
import { FeatureCode } from './features.types'
import NodeFeature from './node/NodeFeature'
import OnboardFeature from './onboard/OnboardFeature'
import OrganizationFeature from './organization/OrganizationFeature'
import PersonFeature from './person/PersonFeature'
import SandboxFeature from './sandbox/SandboxFeature'
import SchemaFeature from './schema/SchemaFeature'
import SkillFeature from './skill/SkillFeature'
import StoreFeature from './store/StoreFeature'
import TestFeature from './test/TestFeature'
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
	]

	public static WithAllFeatures(options: {
		cwd: string
		serviceFactory: ServiceFactory
		storeFactory: StoreFactory
		featureInstaller?: FeatureInstaller
		ui: GraphicsInterface
		emitter: GlobalEmitter
		apiClientFactory: ApiClientFactory
	}): FeatureInstaller {
		const { cwd, serviceFactory, storeFactory, ui, emitter } = options

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
			apiClientFactory: options.apiClientFactory,
		}

		this.features.forEach((Feature) => {
			const feature = new Feature(featureOptions)

			featureInstaller.mapFeature(feature.code, feature)
		})

		return featureInstaller
	}
}
