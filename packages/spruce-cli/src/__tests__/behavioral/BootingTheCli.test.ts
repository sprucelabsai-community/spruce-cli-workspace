import { test, assert } from '@sprucelabs/test-utils'
import AbstractCliTest from '../../tests/AbstractCliTest'

export default class BootTest extends AbstractCliTest {
	@test()
	protected static async canBootTheCli() {
		const cli = await this.Cli()
		assert.isTruthy(cli)
	}
}
