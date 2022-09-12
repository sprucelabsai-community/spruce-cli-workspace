import { test, assert } from '@sprucelabs/test-utils'
import ServiceFactory, { Service } from '../../services/ServiceFactory'
import AbstractCliTest from '../../tests/AbstractCliTest'

export default class ServiceFactoryTest extends AbstractCliTest {
	private static factory: ServiceFactory

	protected static async beforeEach() {
		this.factory = new ServiceFactory()
		await super.beforeEach()
	}

	@test('can build pin service', 'pkg', 'readPackage')
	@test('can build pin service', 'vsCode', 'installExtensions')
	protected static canBuild(type: Service, functionName: string) {
		const service = this.factory.Service(this.cwd, type)
		assert.hasAllFunctions(service, [functionName])
	}
}
