import { HASH_SPRUCE_DIR, diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert, generateId } from '@sprucelabs/test-utils'
import AbstractCliTest from '../../../tests/AbstractCliTest'
import ScriptUpdaterImpl, {
	ScriptUpdater,
} from '../../../updaters/ScriptUpdater'
import WriterFactory from '../../../writers/WriterFactory'

export default class UpgradingANonSpruceNodeModuleTest extends AbstractCliTest {
	protected static async beforeEach(): Promise<void> {
		await super.beforeEach()

		ScriptUpdaterImpl.Class = MockScriptUpdater
		MockScriptUpdater.reset()

		WriterFactory.setWriter('node', MockNodeWriter)
		MockNodeWriter.reset()

		this.cwd = this.resolvePath(generateId() + '_module')
		diskUtil.createDir(this.cwd)

		await this.initModule()
		this.fakeYarnCommands()
	}

	@test()
	protected static async doesNotCreateHashSpruceOnUpdate() {
		await this.upgrade()

		const doesHashSpruceExist = diskUtil.doesDirExist(
			diskUtil.resolvePath(this.cwd, HASH_SPRUCE_DIR)
		)

		assert.isFalse(
			doesHashSpruceExist,
			'Should not have created any hash_spruce_dir'
		)
	}

	@test()
	protected static async doesNotTryToUpdateScripts() {
		await this.upgrade()
		MockScriptUpdater.assertWasNotCalled()
	}

	@test()
	protected static async doesNotWriteNodeFiles() {
		await this.upgrade()
		MockNodeWriter.assertWasNotCalled()
	}

	private static async upgrade() {
		const upgrade = this.Action('node', 'upgrade', {})
		await upgrade.execute({})
	}

	private static fakeYarnCommands() {
		this.commandFaker.fakeCommand(/yarn/, 0)
	}

	private static async initModule() {
		await this.Service('command').execute('yarn init -y')
	}
}

class MockScriptUpdater implements ScriptUpdater {
	private static wasCalled = false

	public static assertWasNotCalled() {
		assert.isFalse(
			this.wasCalled,
			'ScriptUpdater was called when it should not have been'
		)
	}

	public static reset() {
		this.wasCalled = false
	}

	public async update(): Promise<void> {
		MockScriptUpdater.wasCalled = true
		assert.fail('MockScriptUpdater should not be called')
	}
}

class MockNodeWriter {
	public static wasCalled = false

	public static assertWasNotCalled() {
		assert.isFalse(
			this.wasCalled,
			'NodeWriter was called when it should not have been'
		)
	}

	public async writeNodeModule() {
		MockNodeWriter.wasCalled = true
		return []
	}

	public static reset() {
		this.wasCalled = false
	}
}
