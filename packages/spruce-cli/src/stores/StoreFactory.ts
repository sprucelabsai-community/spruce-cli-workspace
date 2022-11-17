import ConversationStore from '../features/conversation/stores/ConversationStore'
import EventStore from '../features/event/stores/EventStore'
import ListenerStore from '../features/event/stores/ListenerStore'
import OnboardingStore from '../features/onboard/stores/OnboardingStore'
import OrganizationStore from '../features/organization/stores/OrganizationStore'
import PermissionStore from '../features/permission/stores/PermissionStore'
import SchemaStore from '../features/schema/stores/SchemaStore'
import SkillStore, {
	SkillStoreOptions,
} from '../features/skill/stores/SkillStore'
import StoreStore from '../features/store/stores/StoreStore'
import ViewStore from '../features/view/stores/ViewStore'
import { GlobalEmitter } from '../GlobalEmitter'
import ServiceFactory from '../services/ServiceFactory'
import { ApiClientFactory } from '../types/apiClient.types'

export default class StoreFactory {
	private serviceFactory: ServiceFactory
	private cwd: string
	private homeDir: string
	private apiClientFactory: ApiClientFactory
	private emitter: GlobalEmitter

	public constructor(options: StoreFactoryOptions) {
		const { cwd, serviceFactory, homeDir, apiClientFactory, emitter } = options

		this.cwd = cwd
		this.serviceFactory = serviceFactory
		this.homeDir = homeDir
		this.apiClientFactory = apiClientFactory
		this.emitter = emitter
	}

	public Store<C extends StoreCode>(
		code: C,
		options?: CreateStoreOptions<C>
	): StoreMap[C] {
		const storeOptions = {
			cwd: options?.cwd ?? this.cwd,
			serviceFactory: this.serviceFactory,
			homeDir: this.homeDir,
			apiClientFactory: options?.apiClientFactory ?? this.apiClientFactory,
			emitter: this.emitter,
			...options,
		}

		if (!storeMap[code]) {
			throw new Error(`Could not find store with code '${code}'.`)
		}

		const store = new storeMap[code](storeOptions as any)

		return store as StoreMap[C]
	}
}

interface UniversalOptions {
	cwd?: string
	apiClientFactory?: ApiClientFactory
}

export type CreateStoreOptions<Code extends StoreCode> =
	Code extends keyof StoreOptionsMap
		? //@ts-ignore
		  StoreOptionsMap[Code] & UniversalOptions
		: UniversalOptions

export interface StoreMap {
	onboarding: OnboardingStore
	schema: SchemaStore
	event: EventStore
	skill: SkillStore
	organization: OrganizationStore
	conversation: ConversationStore
	store: StoreStore
	view: ViewStore
	listener: ListenerStore
	permission: PermissionStore
}

const storeMap = {
	onboarding: OnboardingStore,
	schema: SchemaStore,
	event: EventStore,
	skill: SkillStore,
	organization: OrganizationStore,
	conversation: ConversationStore,
	store: StoreStore,
	view: ViewStore,
	listener: ListenerStore,
	permission: PermissionStore,
}

export type StoreCode = keyof StoreMap

export interface StoreFactoryOptions {
	cwd: string
	serviceFactory: ServiceFactory
	homeDir: string
	apiClientFactory: ApiClientFactory
	emitter: GlobalEmitter
}

export interface StoreOptionsMap {
	skill: SkillStoreOptions
}
