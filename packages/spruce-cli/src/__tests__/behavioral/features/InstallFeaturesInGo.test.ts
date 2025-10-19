import { fake } from '@sprucelabs/spruce-test-fixtures'
import { test, assert } from '@sprucelabs/test-utils'
import AbstractCliTest from '../../../tests/AbstractCliTest'

@fake.login()
export default class InstallFeaturesInGoTest extends AbstractCliTest {
    protected static async beforeEach(): Promise<void> {
        await super.beforeEach()
        await this.go.initGoProject()
    }

    @test()
    protected static async schemaFeatureNotInstalledToStart() {
        const isInstalled = await this.featureInstaller.isInstalled('schema')
        assert.isFalse(isInstalled, 'Schema feature should not be installed')
    }
}
