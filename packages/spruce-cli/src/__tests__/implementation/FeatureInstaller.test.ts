import { test, assert } from '@sprucelabs/test-utils'
import FeatureInstaller from '../../features/FeatureInstaller'
import CommandService from '../../services/CommandService'
import AbstractCliTest from '../../tests/AbstractCliTest'

export default class FeatureInstallerTest extends AbstractCliTest {
	protected static installer: FeatureInstaller

	protected static async beforeEach() {
		await super.beforeEach()
		this.installer = this.featureInstaller
	}

	@test()
	protected static async canGetFeatureDependencies() {
		const dependencies = this.installer.getFeatureDependencies('schema')
		assert.doesInclude(dependencies, { code: 'skill', isRequired: false })
		assert.doesInclude(dependencies, { code: 'node', isRequired: true })
	}

	@test()
	protected static async canGetFeatureDependenciesWithOptional() {
		const dependencies = this.installer.getFeatureDependencies('error')
		assert.doesInclude(dependencies, { code: 'skill', isRequired: false })
		assert.doesInclude(dependencies, { code: 'schema', isRequired: true })
		assert.doesInclude(dependencies, { code: 'node', isRequired: true })
	}

	@test()
	protected static async afterPackageInstallIsCalledOncePerFeature() {
		CommandService.fakeCommand(/yarn/, {
			code: 0,
		})

		let hitCount = 0

		//@ts-ignore
		this.installer.featureMap.schema.afterPackageInstall = () => {
			hitCount++
		}

		await this.installer.install({
			features: [
				{
					code: 'skill',
					options: {
						name: 'testing events',
						description: 'this too, is a great test!',
					},
				},
				{
					code: 'schema',
				},
				{
					code: 'event',
				},
			],
		})

		assert.isEqual(hitCount, 1)
	}
}
