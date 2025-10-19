import { assert, test } from '@sprucelabs/test-utils'
import AbstractCliTest from '../../../tests/AbstractCliTest'

export default class SyncingSchemasInGoTest extends AbstractCliTest {
    @test()
    protected static async canSyncWithoutError() {
        await this.go.initGoProject()
        await this.sync()
    }

    private static async sync() {
        const results = await this.Action('schema', 'sync', {
            shouldAutoHandleDependencies: true,
        }).execute({})

        assert.isFalsy(
            results.errors,
            'Expected no errors when syncing core schemas in a go project.'
        )

        return results
    }
}
