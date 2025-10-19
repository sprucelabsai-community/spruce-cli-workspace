import { fake } from '@sprucelabs/spruce-test-fixtures'
import { test } from '@sprucelabs/test-utils'
import AbstractCliTest from '../../../tests/AbstractCliTest'

@fake.login()
export default class SyncingSchemasInGoTest extends AbstractCliTest {
    @test()
    protected static async canSyncWithoutError() {}
}
