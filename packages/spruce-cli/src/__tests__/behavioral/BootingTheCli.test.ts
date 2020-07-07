import { test, assert } from '@sprucelabs/test'
import AbstractCliTest from '../../AbstractCliTest'

export default class BootTest extends AbstractCliTest {
	@test()
	protected static async canBootTheCli() {
		const cli = await this.Cli()
		assert.isOk(cli)
	}
}
