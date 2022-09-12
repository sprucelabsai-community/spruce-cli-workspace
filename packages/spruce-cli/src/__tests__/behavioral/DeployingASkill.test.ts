import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import { errorAssert } from '@sprucelabs/test-utils'
import CommandService from '../../services/CommandService'
import AbstractCliTest from '../../tests/AbstractCliTest'
import testUtil from '../../tests/utilities/test.utility'

export default class DeployingASkillTest extends AbstractCliTest {
	private static readonly fastHerokuOptions = {
		teamName: process.env.HEROKU_TEAM_NAME ?? '',
		shouldBuildAndLint: false,
		shouldRunTests: false,
	}

	protected static async beforeEach() {
		await super.beforeEach()
		CommandService.fakeCommand('which heroku', {
			code: 0,
		})
		CommandService.fakeCommand('grep api.heroku.com ~/.netrc', {
			code: 0,
		})
		CommandService.fakeCommand('git status', {
			code: 0,
		})
		CommandService.fakeCommand('git init', {
			code: 0,
			stdout: 'Initialized empty Git repository in',
		})

		CommandService.fakeCommand('git ls-remote heroku', {
			code: 0,
		})

		CommandService.fakeCommand('which git', {
			code: 0,
		})

		CommandService.fakeCommand('heroku create good-heroku-name', {
			code: 0,
		})

		CommandService.fakeCommand('heroku create bad-heroku-name', {
			code: 1,
		})

		CommandService.fakeCommand('heroku buildpacks:set heroku/nodejs', {
			code: 0,
		})

		CommandService.fakeCommand('git push --set-upstream heroku master', {
			code: 0,
		})

		diskUtil.writeFile(this.resolvePath('Procfile'), 'web: npm run boot')
	}

	@test()
	protected static async hasDeployAction() {
		assert.isFunction(this.Action('deploy', 'heroku').execute)
	}

	@test()
	protected static async deployHaltedBecauseNotRegistered() {
		await this.FeatureFixture().installCachedFeatures('deploy')

		diskUtil.writeFile(this.resolvePath('src/index.ts'), 'aoeustahoesuntao')

		const results = await this.Action('deploy', 'heroku').execute({
			teamName: process.env.HEROKU_TEAM_NAME ?? '',
		})

		assert.isTruthy(results.errors)
		assert.isArray(results.errors)
		errorAssert.assertError(results.errors[0], 'DEPLOY_FAILED', {
			stage: 'skill',
		})
	}

	@test()
	protected static async deployHaltedWithBadBuild() {
		await this.FeatureFixture().installCachedFeatures('deploy')

		await this.getSkillFixture().registerCurrentSkill({
			name: 'haulted wth bad build',
		})

		diskUtil.writeFile(this.resolvePath('src/index.ts'), 'aoeustahoesuntao')

		const results = await this.Action('deploy', 'heroku').execute({
			teamName: process.env.HEROKU_TEAM_NAME ?? '',
		})

		assert.isTruthy(results.errors)
		assert.isArray(results.errors)
		errorAssert.assertError(results.errors[0], 'DEPLOY_FAILED', {
			stage: 'building',
		})
	}

	@test()
	protected static async healthCheckReportsNotDeployed() {
		const cli = await this.FeatureFixture().installCachedFeatures('deploy')
		const health = (await cli.checkHealth()) as any

		assert.isFalsy(health.errors)
		assert.isTruthy(health.deploy)
		assert.isEqual(health.deploy.status, 'passed')
		assert.isLength(health.deploy.deploys, 0)
	}

	@test()
	protected static async deployHaltedWithBadTest() {
		await this.FeatureFixture().installCachedFeatures('deployWithTests')

		await this.getSkillFixture().registerCurrentSkill({
			name: 'haulted wth bad test',
		})

		const promise = this.Action('test', 'create').execute({
			nameReadable: 'Test failed',
			nameCamel: 'testFailed',
			type: 'behavioral',
		})

		await this.waitForInput()
		await this.ui.sendInput('')

		await promise

		const results = await this.Action('deploy', 'heroku').execute({
			teamName: process.env.HEROKU_TEAM_NAME ?? '',
		})

		assert.isTruthy(results.errors)
		assert.isArray(results.errors)
		errorAssert.assertError(results.errors[0], 'TEST_FAILED')
	}

	@test()
	protected static async errorsIfHerokuClientNotInstalled() {
		CommandService.fakeCommand('which heroku', {
			code: 1,
		})

		await this.FeatureFixture().installCachedFeatures('deploy')

		await this.getSkillFixture().registerCurrentSkill({
			name: 'heroku not installed',
		})

		const results = await this.Action('deploy', 'heroku').execute(
			this.fastHerokuOptions
		)

		assert.isTruthy(results.errors)

		errorAssert.assertError(results.errors[0], 'MISSING_DEPENDENCIES', {
			'dependencies[0].name': 'heroku',
		})
	}

	@test()
	protected static async errorsIfGitNotInstalled() {
		CommandService.fakeCommand('which git', {
			code: 1,
		})

		await this.FeatureFixture().installCachedFeatures('deploy')

		await this.getSkillFixture().registerCurrentSkill({
			name: 'git not installed',
		})

		const results = await this.Action('deploy', 'heroku').execute(
			this.fastHerokuOptions
		)

		assert.isTruthy(results.errors)

		errorAssert.assertError(results.errors[0], 'MISSING_DEPENDENCIES', {
			'dependencies[0].name': 'git',
		})
	}

	@test()
	protected static async errorsIfNotInGitRepo() {
		CommandService.fakeCommand('git status', {
			code: 128,
			stderr:
				'fatal: not a git repository (or any of the parent directories): .git',
		})

		await this.FeatureFixture().installCachedFeatures('deploy')

		await this.getSkillFixture().registerCurrentSkill({
			name: 'not in git repo',
		})

		const promise = this.Action('deploy', 'heroku').execute(
			this.fastHerokuOptions
		)

		await this.waitForInput()

		await this.ui.sendInput('n')

		const results = await promise
		assert.isTruthy(results.errors)

		errorAssert.assertError(results.errors[0], 'DEPLOY_FAILED', {
			stage: 'git',
		})
	}

	@test()
	protected static async canCreateGitRepoIfNeeded() {
		CommandService.fakeCommand('git status', {
			code: 128,
		})

		await this.FeatureFixture().installCachedFeatures('deploy')

		await this.getSkillFixture().registerCurrentSkill({
			name: 'creates git repo',
		})

		const promise = this.Action('deploy', 'heroku').execute(
			this.fastHerokuOptions
		)

		await this.waitForInput()

		CommandService.fakeCommand('git status', {
			code: 0,
		})

		await this.ui.sendInput('y')

		const results = await promise

		assert.isFalsy(results.errors)
	}

	@test()
	protected static async errorsWhenNotLoggedIntoHerkou() {
		CommandService.fakeCommand('grep api.heroku.com ~/.netrc', {
			code: 1,
		})

		await this.FeatureFixture().installCachedFeatures('deploy')

		await this.getSkillFixture().registerCurrentSkill({
			name: 'not logged into heroku',
		})

		const results = await this.Action('deploy', 'heroku').execute(
			this.fastHerokuOptions
		)

		assert.isTruthy(results.errors)

		errorAssert.assertError(results.errors[0], 'DEPLOY_FAILED', {
			stage: 'heroku',
		})
	}

	@test()
	protected static async failsWhenDeclineToCreateProcFile() {
		diskUtil.deleteFile(this.resolvePath('Procfile'))
		await this.FeatureFixture().installCachedFeatures('deploy')

		await this.getSkillFixture().registerCurrentSkill({
			name: 'decline proc file',
		})

		const promise = this.Action('deploy', 'heroku').execute(
			this.fastHerokuOptions
		)

		await this.waitForInput()

		assert.doesInclude(this.ui.invocations, {
			command: 'confirm',
		})
		await this.ui.sendInput('n')

		const results = await promise

		assert.isTruthy(results.errors)

		errorAssert.assertError(results.errors[0], 'DEPLOY_FAILED', {
			stage: 'procfile',
		})
	}

	@test()
	protected static async createsValidProcFile() {
		diskUtil.deleteFile(this.resolvePath('Procfile'))
		await this.FeatureFixture().installCachedFeatures('deploy')

		await this.getSkillFixture().registerCurrentSkill({
			name: 'valid proc file',
		})

		const promise = this.Action('deploy', 'heroku').execute(
			this.fastHerokuOptions
		)

		await this.waitForInput()

		await this.ui.sendInput('y')

		const results = await promise

		assert.isFalsy(results.errors)

		const match = testUtil.assertFileByNameInGeneratedFiles(
			'Procfile',
			results.files
		)

		const contents = diskUtil.readFile(match)

		assert.isEqual(contents, 'worker: npm run boot')
	}

	@test()
	protected static async failsWhenDeclineToCreateRemoteBranch() {
		CommandService.fakeCommand('git ls-remote heroku', {
			code: 128,
		})

		await this.FeatureFixture().installCachedFeatures('deploy')

		await this.getSkillFixture().registerCurrentSkill({
			name: 'decline to create remote branch',
		})

		const promise = this.Action('deploy', 'heroku').execute(
			this.fastHerokuOptions
		)

		await this.waitForInput()

		assert.doesInclude(this.ui.invocations, {
			command: 'confirm',
		})
		await this.ui.sendInput('n')

		const results = await promise

		assert.isTruthy(results.errors)

		errorAssert.assertError(results.errors[0], 'DEPLOY_FAILED', {
			stage: 'remote',
		})
	}

	@test()
	protected static async asksForHerokuAppName() {
		CommandService.fakeCommand('git ls-remote heroku', {
			code: 128,
		})

		await this.FeatureFixture().installCachedFeatures('deploy')

		await this.getSkillFixture().registerCurrentSkill({
			name: 'ask for app name',
		})

		const promise = this.Action('deploy', 'heroku').execute(
			this.fastHerokuOptions
		)

		await this.waitForInput()

		await this.ui.sendInput('y')

		await this.waitForInput()

		assert.doesInclude(this.ui.invocations, {
			command: 'prompt',
			options: {
				type: 'text',
			},
		})

		await this.ui.sendInput(`good-heroku-name`)

		const results = await promise

		assert.isFalsy(results.errors)
	}

	@test()
	protected static async keepsAskingForAppNameUntilAGoodOneIsSelected() {
		CommandService.fakeCommand('git ls-remote heroku', {
			code: 128,
		})
		await this.FeatureFixture().installCachedFeatures('deploy')

		await this.getSkillFixture().registerCurrentSkill({
			name: 'haulted wth bad build',
		})

		const promise = this.Action('deploy', 'heroku').execute(
			this.fastHerokuOptions
		)

		await this.waitForInput()

		assert.doesInclude(this.ui.invocations, {
			command: 'confirm',
		})

		await this.ui.sendInput('y')

		await this.waitForInput()

		assert.doesInclude(this.ui.invocations, {
			command: 'prompt',
			options: {
				type: 'text',
			},
		})
		await this.ui.sendInput(`bad-heroku-name`)
		await this.waitForInput()
		await this.ui.sendInput('bad-heroku-name')
		await this.waitForInput()
		await this.ui.sendInput('good-heroku-name')

		const results = await promise

		assert.isFalsy(results.errors)
	}

	@test()
	protected static async failsWithPendingChangesToCommit() {
		CommandService.fakeCommand('git status', {
			code: 0,
			stdout: 'Changes not staged for commit',
		})

		await this.FeatureFixture().installCachedFeatures('deploy')

		await this.getSkillFixture().registerCurrentSkill({
			name: 'pending changes to commit',
		})

		const results = await this.Action('deploy', 'heroku').execute(
			this.fastHerokuOptions
		)

		assert.isTruthy(results.errors)

		errorAssert.assertError(results.errors[0], 'DEPLOY_FAILED', {
			stage: 'git',
		})
	}

	@test()
	protected static async canDeploySkill() {
		await this.FeatureFixture().installCachedFeatures('deploy')

		await this.getSkillFixture().registerCurrentSkill({
			name: 'can deploy',
		})

		const results = await this.Action('deploy', 'heroku').execute(
			this.fastHerokuOptions
		)

		assert.isFalsy(results.errors)
	}
}
