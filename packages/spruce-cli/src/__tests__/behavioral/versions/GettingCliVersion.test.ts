import { test, assert } from '@sprucelabs/test-utils'
import AbstractCliTest from '../../../tests/AbstractCliTest'

export default class GettingCliVersionTest extends AbstractCliTest {
    protected static async beforeEach() {
        await super.beforeEach()
        this.cwd = this.resolvePath(__dirname, '..', '..', '..', '..')
    }

    @test()
    protected static async canGetVersionWithDashV() {
        const results = await this.Service('command').execute(
            'node ./build/index.js -v'
        )
        const needle = require('../../../../package.json').version

        assert.doesInclude(results.stdout, needle)
    }

    @test()
    protected static async canGetVersionWithDashVersion() {
        const results = await this.Service('command').execute(
            'node ./build/index.js --version'
        )
        const needle = require('../../../../package.json').version

        assert.doesInclude(results.stdout, needle)
    }
}
