import { versionUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test'
import AbstractSkillTest from '../../tests/AbstractSkillTest'
import testUtil from '../../tests/utilities/test.utility'
import { RegisteredSkill } from '../../types/cli.types'

const stamp = new Date().getTime()
const EVENT_NAME_READABLE = 'did book appointment'
const EVENT_NAME = `test-register-skill-views${stamp}`
const EVENT_CAMEL = `testRegisterSkillViews${stamp}`

export default class RegisteringGlobalEventsTest extends AbstractSkillTest {
	protected static skillCacheKey = 'events'
	protected static skill: RegisteredSkill

	protected static async beforeAll() {
		await super.beforeAll()
		const orgFixture = this.OrganizationFixture()
		const skillFixture = this.SkillFixture()

		const org = await orgFixture.seedDemoOrg({ name: 'my org' })

		this.skill = await skillFixture.registerCurrentSkill({
			name: 'heartwood test',
		})

		await orgFixture.installSkillAtOrganization(this.skill.id, org.id)
	}

	@test()
	protected static async canCreateGlobalEvent() {
		const results = await this.cli
			.getFeature('event')
			.Action('create')
			.execute({
				isGlobal: true,
				nameReadable: EVENT_NAME_READABLE,
				nameKebab: EVENT_NAME,
				nameCamel: EVENT_CAMEL,
			})

		assert.isFalsy(results.errors)

		const optionsFile = testUtil.assertsFileByNameInGeneratedFiles(
			'event.options.ts',
			results.files
		)

		const importedOptions = await this.Service('import').importDefault(
			optionsFile
		)
		assert.isEqualDeep(importedOptions, { isGlobal: true })

		const version = versionUtil.generateVersion().dirValue
		const contractFile = testUtil.assertsFileByNameInGeneratedFiles(
			`${EVENT_CAMEL}.${version}.contract.ts`,
			results.files
		)

		const importedContract = await this.Service('import').importDefault(
			contractFile
		)

		const sig =
			importedContract.eventSignatures[
				`${this.skill.slug}.${EVENT_NAME}::${version}`
			]

		assert.isTrue(sig.isGlobal)
		assert.isFalsy(sig.emitPayloadSchema)
	}

	@test()
	protected static async registersGloballyOnBoot() {
		const boot = await this.cli
			.getFeature('skill')
			.Action('boot')
			.execute({ local: true })

		const client = await this.connectToApi({
			skillId: this.skill.id,
			apiKey: this.skill.apiKey,
		})

		const contractResults = await this.Store('event', {
			apiClientFactory: async () => client,
		}).fetchEventContracts()

		const contracts = contractResults.contracts

		boot.meta?.kill()

		const version = versionUtil.generateVersion().constValue
		const eventName = `${this.skill.slug}.${EVENT_NAME}::${version}`

		assert.isTruthy(contracts[1].eventSignatures[eventName])
	}
}