import Cli from '../cli'
import ServiceFactory from '../services/ServiceFactory'
import {
	ApiClient,
	ApiClientFactory,
	ApiClientFactoryOptions,
} from '../types/apiClient.types'

const TEST_HOST = 'https://sandbox.mercury.spruce.ai'

export default class MercuryFixture {
	private clients: Record<string, ApiClient> = {}
	private cwd: string
	private serviceFactory: ServiceFactory
	private apiClientFactory: ApiClientFactory

	public constructor(cwd: string, serviceFactory: ServiceFactory) {
		this.cwd = cwd
		this.serviceFactory = serviceFactory
		this.apiClientFactory = Cli.buildApiClientFactory(
			this.cwd,
			this.serviceFactory,
			{ host: TEST_HOST }
		)
	}

	public getApiClientFactory(): ApiClientFactory {
		return this.apiClientFactory
	}

	public connectToApi(options?: ApiClientFactoryOptions) {
		return this.getApiClientFactory()(options)
	}

	public async logout(client: ApiClient) {
		await this.disconnect(client)
		await this.connectToApi()
	}

	public async logoutAll() {
		for (const client of Object.values(this.clients)) {
			await this.logout(client)
		}
	}

	public async disconnect(client: ApiClient) {
		await client.disconnect()
		for (const key in this.clients) {
			if (this.clients[key] === client) {
				delete this.clients[key]
			}
		}
	}

	public async disconnectAll() {
		for (const client of Object.values(this.clients)) {
			await this.disconnect(client)
		}
	}
}
