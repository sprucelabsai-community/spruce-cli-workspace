import { EventContract } from '@sprucelabs/mercury-types'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import { CliInterface } from '../../../cli'
import AbstractCliTest from '../../../tests/AbstractCliTest'
import testUtil from '../../../tests/utilities/test.utility'

export default class GeneratingMercuryEventContractTest extends AbstractCliTest {
	private static cli: CliInterface

	protected static async beforeEach() {
		await super.beforeEach()
		this.cli = await this.Cli()
		diskUtil.writeFile(this.resolvePath('package.json'), '{}')
	}

	@test()
	protected static async hasEventContractFeature() {
		assert.isTruthy(this.cli.getFeature('eventContract'))
	}

	@test()
	protected static async hasPullFeature() {
		assert.isFunction(this.Action('eventContract', 'pull').execute)
	}

	@test()
	protected static async generatesContractAtCwd() {
		await this.FeatureFixture().installCachedFeatures('events')
		const results = await this.Action('eventContract', 'pull').execute({})
		assert.isFalsy(results.errors)

		const match = testUtil.assertFileByNameInGeneratedFiles(
			'events.contract.ts',
			results.files
		)

		assert.isEqual(match, this.resolvePath('events.contract.ts'))

		assert.doesInclude(results.files ?? [], {
			name: 'events.contract.ts',
			action: 'generated',
		})

		const contents = diskUtil.readFile(match)

		assert.doesInclude(
			contents,
			"import { buildEventContract } from '@sprucelabs/mercury-types'"
		)
	}

	@test()
	protected static async generatesAtDestination() {
		await this.FeatureFixture().installCachedFeatures('events')
		const results = await this.Action('eventContract', 'pull').execute({
			destination: './src/tests',
		})

		const match = testUtil.assertFileByNameInGeneratedFiles(
			'events.contract.ts',
			results.files
		)
		const expected = this.resolvePath('src/tests/events.contract.ts')

		assert.isEqual(expected, match)
	}

	@test()
	protected static async savesContractLocallyAndImportsAsDefault() {
		const contracts = await this.installSkillAndPullContracts()

		assert.isArray(contracts)
		assert.isObject(contracts[0].eventSignatures)
		assert.isObject(contracts[0].eventSignatures[`did-message::v2020_12_25`])
	}

	@test()
	protected static async doesNotPullGlobalContracts() {
		this.cli = await this.FeatureFixture().installCachedFeatures('events')

		await this.getSkillFixture().registerCurrentSkill({
			name: 'heartwood test',
		})

		const events = await this.Store('event')
		await events.registerEventContract({
			eventContract: {
				eventSignatures: {
					'test-event::v2020_01_01': {
						isGlobal: true,
					},
				},
			},
		})

		const contracts = await this.installSkillAndPullContracts()

		assert.isEqual(contracts.length, 1)
		assert.isObject(contracts[0].eventSignatures)
		assert.isObject(contracts[0].eventSignatures['add-role::v2020_12_25'])
	}

	@test()
	protected static async contractHasTypes() {
		this.cli = await this.FeatureFixture().installCachedFeatures('node')

		const promise = this.Action('eventContract', 'pull', {
			shouldAutoHandleDependencies: true,
		}).execute({})

		const results = await promise

		const match = testUtil.assertFileByNameInGeneratedFiles(
			'events.contract.ts',
			results.files
		)

		const contents = diskUtil.readFile(match)

		assert.doesInclude(contents, 'export default eventContracts')
		assert.doesInclude(contents, 'as const')
		assert.doesInclude(
			contents,
			'export type CoreEventContract = typeof eventContracts[0] & typeof eventContracts[1]'
		)
	}

	@test()
	protected static async generatingASecondTimeReportsAnUpdate() {
		this.cli = await this.FeatureFixture().installCachedFeatures('events')
		await this.Action('eventContract', 'pull').execute({})

		const results = await this.Action('eventContract', 'pull').execute({})

		testUtil.assertFileByNameInGeneratedFiles(
			'events.contract.ts',
			results.files
		)

		assert.doesInclude(results.files ?? [], {
			name: 'events.contract.ts',
			action: 'updated',
		})
	}

	private static async installSkillAndPullContracts() {
		this.cli = await this.FeatureFixture().installCachedFeatures('events')
		return await this.pullContracts()
	}

	private static async pullContracts() {
		const results = await this.Action('eventContract', 'pull').execute({})

		const match = testUtil.assertFileByNameInGeneratedFiles(
			'events.contract.ts',
			results.files
		)

		const contracts = await this.Service('import').importDefault(match)
		return contracts as EventContract[]
	}
}
