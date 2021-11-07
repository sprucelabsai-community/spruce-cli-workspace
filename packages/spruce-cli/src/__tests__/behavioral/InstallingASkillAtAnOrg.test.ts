import { eventAssertUtil } from '@sprucelabs/spruce-event-utils'
import { test, assert, assertUtil } from '@sprucelabs/test'
import { errorAssertUtil } from '@sprucelabs/test-utils'
import AbstractCliTest from '../../tests/AbstractCliTest'

export default class InstallingASkillAtAnOrgTest extends AbstractCliTest {
	protected static async beforeEach() {
		await super.beforeEach()
		await this.login()
		await this.getOrganizationFixture().clearAllOrgs()
	}

	private static async login() {
		await this.getPersonFixture().loginAsDemoPerson(
			process.env.DEMO_NUMBER_INSTALL_SKILL
		)
	}

	@test()
	protected static async hasInstallAction() {
		await this.Cli()
		assert.isFunction(this.Action('organization', 'install').execute)
	}

	@test()
	protected static async cantInstallWithoutBeingLoggedIn() {
		const org = await this.getOrganizationFixture().seedDemoOrg({
			name: 'new org',
		})

		await this.FeatureFixture().installCachedFeatures('organizations')

		await this.getSkillFixture().registerCurrentSkill({
			name: 'my amazing skill',
		})

		await this.getPersonFixture().logout()

		await this.Cli()

		const anonResults = await this.Action('organization', 'install').execute({
			organizationId: org.id,
		})

		assert.isTruthy(anonResults.errors)
		eventAssertUtil.assertError(anonResults.errors[0], 'UNAUTHORIZED_ACCESS')
	}

	@test()
	protected static async cantInstallWithoutAnyOrgs() {
		await this.FeatureFixture().installCachedFeatures('organizations')

		await this.getSkillFixture().registerCurrentSkill({
			name: 'my amazing skill',
		})

		const anonResults = await this.Action('organization', 'install').execute({})

		assert.isTruthy(anonResults.errors)
		errorAssertUtil.assertError(anonResults.errors[0], 'NO_ORGANIZATIONS_FOUND')
	}

	@test()
	protected static async cantInstallWithoutBeingRegistered() {
		await this.FeatureFixture().installCachedFeatures('organizations')

		await this.getOrganizationFixture().seedDemoOrg({
			name: 'My great org',
		})

		const anonResults = await this.Action('organization', 'install').execute({})

		assert.isTruthy(anonResults.errors)
		errorAssertUtil.assertError(anonResults.errors[0], 'SKILL_NOT_REGISTERED')
	}

	@test()
	protected static async canInstallSkillAtOrg() {
		await this.FeatureFixture().installCachedFeatures('organizations')

		const org = await this.getOrganizationFixture().seedDemoOrg({
			name: 'My great org',
		})

		const skill = await this.getSkillFixture().registerCurrentSkill({
			name: 'my amazing skill',
		})

		const promise = this.Action('organization', 'install').execute({})

		await this.waitForInput()

		assert.doesInclude(
			this.ui.lastInvocation().command,
			'confirm',
			`ui didn't get back a confirm, got back \n\n${assertUtil.stringify(
				this.ui.lastInvocation()
			)}`
		)

		await this.ui.sendInput('')

		const results = await promise

		assert.isFalsy(results.errors)

		const isInstalled = await this.Store('organization').isSkillInstalledAtOrg(
			skill.id,
			org.id
		)

		assert.isTruthy(isInstalled)
	}

	@test()
	protected static async asksYouToSelectOrgWithMoreThanOne() {
		await this.FeatureFixture().installCachedFeatures('organizations')

		await this.getOrganizationFixture().seedDemoOrg({
			name: 'My great org',
		})

		const org2 = await this.getOrganizationFixture().seedDemoOrg({
			name: 'My great org',
		})

		const skill = await this.getSkillFixture().registerCurrentSkill({
			name: 'my amazing skill',
		})

		const promise = this.Action('organization', 'install').execute({})

		await this.waitForInput()

		assert.doesInclude(this.ui.lastInvocation().options, {
			type: 'select',
		})

		await this.ui.sendInput(org2.id)

		const results = await promise

		assert.isFalsy(results.errors)

		const isInstalled = await this.Store('organization').isSkillInstalledAtOrg(
			skill.id,
			org2.id
		)

		assert.isTruthy(isInstalled)
	}
}
