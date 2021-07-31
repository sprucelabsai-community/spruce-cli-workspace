import * as coreSchemas from '@sprucelabs/spruce-core-schemas'
import { versionUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test'
import AbstractSchemaTest from '../../tests/AbstractSchemaTest'

export default class FeatureCommandExecuterTest extends AbstractSchemaTest {
	@test()
	protected static async shouldInstallDependentFeatures() {
		const executer = this.Action('schema', 'create', {
			shouldAutoHandleDependencies: true,
		})
		const promise = executer.execute({})

		await this.waitForInput()

		await this.ui.sendInput('yes')

		await this.ui.sendInput('Skill with 1 dependency')

		await this.ui.sendInput('A skill that is so good')

		await this.waitForInput()

		await this.ui.sendInput('\n')

		await this.ui.sendInput('Restaurant')

		await this.ui.sendInput('\n')

		await this.wait(100)

		const installer = this.getFeatureInstaller()
		let isInstalled = await installer.isInstalled('schema')

		assert.isFalse(isInstalled)

		await promise

		await this.assertHealthySkillNamed('skill-with-1-dependency', {
			skill: { status: 'passed' },
			schema: {
				status: 'passed',
				schemas: this.generateExpectedHealthSchemas([
					...Object.values(coreSchemas),
					{
						id: 'restaurant',
						name: 'Restaurant',
						namespace: 'SkillWith1Dependency',
						version: versionUtil.generateVersion().constValue,
					},
				]),
			},
		})

		isInstalled = await installer.isInstalled('schema')

		assert.isTrue(isInstalled)
	}

	@test()
	protected static async shouldInstallTwoDependentFeatures() {
		const executer = this.Action('error', 'create', {
			shouldAutoHandleDependencies: true,
		})
		const promise = executer.execute({})

		await this.waitForInput()

		await this.ui.sendInput('yes')

		await this.ui.sendInput('My skill with 2 dependent features')

		await this.ui.sendInput('A skill that is so good')

		await this.waitForInput()

		await this.ui.sendInput('\n')

		await this.waitForInput()

		await this.ui.sendInput('\n')

		await this.ui.sendInput('Test error')

		await this.ui.sendInput('\n')

		await promise

		await this.assertHealthySkillNamed('my-skill-with-2-dependent-features', {
			skill: { status: 'passed' },
			schema: {
				status: 'passed',
				schemas: [],
			},
			error: {
				errorSchemas: [{ name: 'Test error', id: 'testError' }],
				status: 'passed',
			},
		})

		const installer = this.getFeatureInstaller()
		const isInstalled = await installer.isInstalled('schema')

		assert.isTrue(isInstalled)
	}
}
