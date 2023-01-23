import Cli from '../../Cli-1'
import { DEFAULT_HOST } from '../../constants'
import ServiceFactory from '../../services/ServiceFactory'
import {
	ApiClientFactory,
	ApiClientFactoryOptions,
} from '../../types/apiClient.types'
require('dotenv').config()

const TEST_HOST = process.env.TEST_HOST ?? DEFAULT_HOST

export default class MercuryFixture {
	private cwd: string
	private serviceFactory: ServiceFactory
	private apiClientFactory: any

	public constructor(cwd: string, serviceFactory: ServiceFactory) {
		this.cwd = cwd
		this.serviceFactory = serviceFactory
		this.apiClientFactory = Cli.buildApiClientFactory(
			this.cwd,
			this.serviceFactory,
			{ host: TEST_HOST, shouldReconnect: false }
		)
	}

	public getApiClientFactory(): ApiClientFactory {
		return this.apiClientFactory
	}

	public connectToApi(options?: ApiClientFactoryOptions) {
		return this.getApiClientFactory()(options)
	}

	public async disconnectAll() {
		await Cli.resetApiClients()
	}
}
