import {
	buildPermissionContract,
	validateEventContract,
} from '@sprucelabs/mercury-types'
import {
	buildEmitTargetAndPayloadSchema,
	eventContractUtil,
	eventNameUtil,
	eventTargetSchema,
} from '@sprucelabs/spruce-event-utils'
import { diskUtil, versionUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test'
import { errorAssert } from '@sprucelabs/test-utils'
import CreateAction from '../../features/event/actions/CreateAction'
import EventStore from '../../features/event/stores/EventStore'
import AbstractEventTest from '../../tests/AbstractEventTest'
import { DEMO_NUMBER_EVENT_STORE } from '../../tests/constants'
import testUtil from '../../tests/utilities/test.utility'

const EVENT_NAME_READABLE = 'my event store amazing event'
const EVENT_NAME = 'my-event-store-amazing-event'
const EVENT_CAMEL = 'myEventStoreAmazingEvent'

export default class EventStoreTest extends AbstractEventTest {
	private static createAction: CreateAction
	protected static get version() {
		return versionUtil.generateVersion()
	}

	public static async beforeEach() {
		await super.beforeEach()
		this.createAction = this.Action<CreateAction>('event', 'create')
		diskUtil.writeFile(this.resolvePath('package.json'), '{}')
		await this.people.loginAsDemoPerson(DEMO_NUMBER_EVENT_STORE)
	}

	@test()
	protected static async canInstantiateEventStore() {
		assert.isTruthy(this.Store('event'))
	}

	@test()
	protected static async hasFetchEventContractsMethod() {
		assert.isFunction(this.Store('event').fetchEventContracts)
	}

	@test()
	protected static async fetchesCoreEventContracts() {
		const results = await this.Store('event').fetchEventContracts({
			localNamespace: 'my-skill',
		})
		const { contracts, errors } = results

		assert.isTrue(contracts.length >= 1)

		for (const contract of contracts) {
			validateEventContract(contract)
		}

		assert.isEqual(errors.length, 0)
	}

	@test()
	protected static async registerEventContract() {
		const organizationFixture = this.getOrganizationFixture()
		const org = await organizationFixture.seedDemoOrg({
			name: 'my new org',
		})

		const { eventStore: eventStore1, skill: skill1 } =
			await this.seedSkillAndInstallAtOrg(org, 'skill 1')

		const { eventStore: eventStore2 } = await this.seedSkillAndInstallAtOrg(
			org,
			'skill 2'
		)

		await eventStore1.registerEventContract({
			eventContract: {
				eventSignatures: {
					[`my-fantastic-event::${this.version.constValue}`]: {
						emitPayloadSchema: buildEmitTargetAndPayloadSchema({
							eventName: `my-fantastic-event::${this.version.constValue}`,
							targetSchema: eventTargetSchema,
						}),
						emitPermissionContract: buildPermissionContract({
							id: 'my-fantastic-event-contract',
							name: 'Fantastic emit perms',
							permissions: [
								{
									id: 'can-emit-perms',
									name: 'can emit perm',
									defaults: {
										skill: false,
									},
								},
							],
						}),
					},
				},
			},
		})

		const { contracts } = await eventStore2.fetchEventContracts({
			localNamespace: 'my-skill',
		})

		assert.isTrue(contracts.length > 2)

		const skillContract = contracts[1]

		const sig = eventContractUtil.getSignatureByName(
			skillContract,
			`${skill1.slug}.my-fantastic-event::${this.version.constValue}`
		)

		assert.isEqual(
			sig.emitPermissionContract?.id,
			'my-fantastic-event-contract'
		)
	}

	@test()
	protected static async badLocalContractThrowsNiceError() {
		await this.FeatureFixture().installCachedFeatures('events')

		const skill = await this.getSkillFixture().registerCurrentSkill({
			name: 'my new skill',
		})

		const results = await this.createAction.execute({
			nameReadable: EVENT_NAME_READABLE,
			nameKebab: EVENT_NAME,
			nameCamel: EVENT_CAMEL,
		})

		assert.isFalsy(results.errors)

		const match = testUtil.assertFileByNameInGeneratedFiles(
			`emitPayload.builder.ts`,
			results.files
		)

		diskUtil.writeFile(match, 'export default {}')

		const err = await assert.doesThrowAsync(
			() => this.Store('event').loadLocalContract(skill.slug),
			new RegExp(
				`${skill.slug}.${EVENT_NAME}::${
					versionUtil.generateVersion().constValue
				}`
			)
		)

		errorAssert.assertError(err, 'INVALID_EVENT_CONTRACT')
	}

	@test()
	protected static async badLocalSignature() {
		await this.FeatureFixture().installCachedFeatures('events')

		const skill = await this.getSkillFixture().registerCurrentSkill({
			name: 'my new skill',
		})

		const results = await this.createAction.execute({
			nameReadable: EVENT_NAME_READABLE,
			nameKebab: EVENT_NAME,
			nameCamel: EVENT_CAMEL,
		})

		assert.isFalsy(results.errors)

		const match = testUtil.assertFileByNameInGeneratedFiles(
			`event.options.ts`,
			results.files
		)

		diskUtil.writeFile(match, 'export default {waka: true}')

		const err = await assert.doesThrowAsync(
			() => this.Store('event').loadLocalContract(skill.slug),
			new RegExp(
				`${skill.slug}.${EVENT_NAME}::${
					versionUtil.generateVersion().constValue
				}`
			)
		)

		errorAssert.assertError(err, 'INVALID_EVENT_CONTRACT')
	}

	@test()
	protected static async mixesInLocalContracts() {
		await this.FeatureFixture().installCachedFeatures('events')

		const skill = await this.getSkillFixture().registerCurrentSkill({
			name: 'my new skill',
		})

		await this.createAction.execute({
			nameReadable: EVENT_NAME_READABLE,
			nameKebab: EVENT_NAME,
			nameCamel: EVENT_CAMEL,
		})

		await this.copyEventBuildersAndPermissions(EVENT_NAME)

		await this.Action('event', 'sync').execute({})

		const { contracts } = await this.Store('event').fetchEventContracts({
			localNamespace: skill.slug,
			namespaces: ['core'],
		})

		assert.isLength(contracts, 2)

		const name = eventNameUtil.join({
			eventName: EVENT_NAME,
			eventNamespace: skill.slug,
			version: this.version.constValue,
		})

		let wasFound = false
		for (const contract of contracts) {
			if (contract.eventSignatures[name]?.emitPayloadSchema) {
				wasFound = true
				assert.isEqual(
					contract.eventSignatures[name].emitPayloadSchema?.id,
					EVENT_CAMEL + 'EmitTargetAndPayload'
				)
				assert.isTruthy(
					contract.eventSignatures[name].emitPayloadSchema?.fields?.target
				)
				assert.isTruthy(
					contract.eventSignatures[name].emitPayloadSchema?.fields?.payload
				)
				assert.isTruthy(contract.eventSignatures[name].responsePayloadSchema)
				assert.isTruthy(contract.eventSignatures[name].emitPermissionContract)
				assert.isTruthy(contract.eventSignatures[name].listenPermissionContract)

				validateEventContract(contract)
			}
		}

		assert.isTrue(wasFound)
	}

	@test()
	protected static async mixesInLocalContractWithGlobalEventsAndDoesNotReturnContractTwice() {
		const { skill, fqen } = await this.installAndRegisterOneGlobalEvent()

		const { contracts } = await this.Store('event').fetchEventContracts({
			localNamespace: skill.slug,
		})

		const totalMatches = contracts.reduce((count, contract) => {
			if (contract.eventSignatures[fqen]) {
				count++
			}
			return count
		}, 0)

		assert.isEqual(totalMatches, 1)
	}

	@test()
	protected static async doesNotLoadGlobalContractsForSelf() {
		const { fqen, skill } = await this.installAndRegisterOneGlobalEvent()

		const eventsPath = this.resolvePath('src', 'events')
		diskUtil.deleteDir(eventsPath)

		const { contracts } = await this.Store('event').fetchEventContracts({
			localNamespace: skill.slug,
		})

		const unified = eventContractUtil.unifyContracts(contracts)

		assert.isTruthy(unified)
		assert.doesThrow(() => eventContractUtil.getSignatureByName(unified, fqen))
	}

	private static async installAndRegisterOneGlobalEvent() {
		await this.FeatureFixture().installCachedFeatures('events')

		const skill = await this.getSkillFixture().registerCurrentSkill({
			name: 'event store test skill',
		})

		const results = await this.createAction.execute({
			nameReadable: EVENT_NAME_READABLE,
			nameKebab: EVENT_NAME,
			nameCamel: EVENT_CAMEL,
			isGlobal: true,
		})

		const { fqen } = results.meta ?? {}

		assert.isTruthy(fqen)

		const boot = await this.Action('skill', 'boot').execute({ local: true })

		boot.meta?.kill()

		EventStore.clearCache()

		return { boot, skill, fqen, createResults: results }
	}

	private static async seedSkillAndInstallAtOrg(org: any, name: string) {
		const skill = await this.getSkillFixture().seedDemoSkill({
			name,
		})

		await this.getOrganizationFixture().installSkillAtOrganization(
			skill.id,
			org.id
		)

		const client = await this.connectToApi({
			skillId: skill.id,
			apiKey: skill.apiKey,
		})

		const eventStore = this.Store('event', {
			apiClientFactory: async () => {
				return client
			},
		})

		return { eventStore, skill }
	}
}
