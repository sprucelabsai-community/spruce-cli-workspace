import {
	MercuryClientFactory,
	MercuryTestClient,
} from '@sprucelabs/mercury-client'
import { coreEventContracts } from '@sprucelabs/mercury-core-events'
import { EventSignature, SpruceSchemas } from '@sprucelabs/mercury-types'
import { buildSchema } from '@sprucelabs/schema'
import {
	buildEmitTargetAndPayloadSchema,
	eventAssertUtil,
	eventResponseUtil,
	eventTargetSchema,
} from '@sprucelabs/spruce-event-utils'
import {
	diskUtil,
	MERCURY_API_NAMESPACE,
	versionUtil,
} from '@sprucelabs/spruce-skill-utils'
import { eventFaker } from '@sprucelabs/spruce-test-fixtures'
import { test, assert, generateId } from '@sprucelabs/test-utils'
import { errorAssert } from '@sprucelabs/test-utils'
import ListenAction, {
	CORE_EVENT_NAMESPACE,
} from '../../../features/event/actions/ListenAction'
import AbstractEventTest from '../../../tests/AbstractEventTest'
import testUtil from '../../../tests/utilities/test.utility'

export default class CreatingAListenerTest extends AbstractEventTest {
	private static readonly expectedVersion =
		versionUtil.generateVersion().constValue
	private static listen: ListenAction

	protected static async beforeEach() {
		await super.beforeEach()
		this.listen = this.Action('event', 'listen')
	}

	@test()
	protected static async throwsWithBadNamespace() {
		await this.installEventFeature('events')

		const results = await this.listen.execute({
			namespace: 'taco-bell',
		})

		assert.isTruthy(results.errors)
		const err = results.errors[0]

		errorAssert.assertError(err, 'INVALID_NAMESPACES', {
			namespaces: ['taco-bell'],
		})
	}

	@test()
	protected static async throwsWithBadEventName() {
		await this.installEventFeature('events')
		const results = await this.listen.execute({
			namespace: 'heartwood',
			eventName: 'bad-time',
		})

		assert.isTruthy(results.errors)
		const err = results.errors[0]

		errorAssert.assertError(err, 'INVALID_PARAMETERS', {
			parameters: ['eventName'],
		})
	}

	@test()
	protected static async generatesMapFile() {
		const match = await this.installEventsCreateListenerAndGetListenerMap()
		await this.Service('typeChecker').check(match)
	}

	@test()
	protected static async createsValidListener() {
		const { version, results, cli } =
			await this.installEventsAndCreateListener()

		const match = testUtil.assertFileByNameInGeneratedFiles(
			`will-boot.${version}.listener.ts`,
			results.files
		)

		assert.doesInclude(match, version)

		await this.Service('typeChecker').check(match)

		const health = await cli.checkHealth()

		assert.isFalsy(health?.event?.errors)
		assert.isTruthy(health.skill)

		assert.isUndefined(health.skill.errors)
		assert.isTruthy(health.event)

		assert.doesInclude(health.event.listeners, {
			eventName: 'will-boot',
			eventNamespace: 'skill',
			version,
		})
	}

	@test()
	protected static async creatingANewListenerAsksWhichEventToListenTo() {
		await this.installEventFeature('events')
		await this.executeAndWaitForInput()

		let lastInvocation = this.ui.getLastInvocation()

		assert.isEqual(lastInvocation.command, 'prompt')
		assert.doesInclude(lastInvocation.options.label, 'namespace')

		await this.ui.sendInput(MERCURY_API_NAMESPACE)
		await this.waitForInput()

		lastInvocation = this.ui.getLastInvocation()

		assert.doesInclude(lastInvocation.options.label, 'event')

		this.ui.reset()
	}

	@test()
	protected static async loadsContractsFilteringByDependencies() {
		MercuryClientFactory.setIsTestMode(true)
		MercuryTestClient.setShouldRequireLocalListeners(true)

		let passedTarget: any
		await this.fakeGetEventContracts((target) => {
			passedTarget = target
		})

		const namespace = generateId()
		await this.installAddDependencyExecuteAndWaitForInput(namespace)

		assert.isEqualDeep(passedTarget, {
			namespaces: [namespace, CORE_EVENT_NAMESPACE],
		})

		this.ui.reset()
	}

	private static async fakeGetEventContracts(
		cb?: (
			target?: SpruceSchemas.Mercury.v2020_12_25.GetEventContractsTarget | null
		) => void,
		results?: SpruceSchemas.Mercury.v2020_12_25.GetEventContractsResponsePayload['contracts']
	) {
		await eventFaker.on('get-event-contracts::v2020_12_25', ({ target }) => {
			cb?.(target)

			return {
				contracts: results ?? [...(coreEventContracts as any)],
			}
		})
	}

	@test()
	protected static async generatesTypedListenerWithoutPayloads() {
		const { contents } =
			await this.setupSkillsInstallAtOrgRegisterEventContractAndGenerateListener(
				{
					isGlobal: true,
				}
			)

		assert.doesInclude(
			contents,
			'export default async (event: SpruceEvent): SpruceEventResponse'
		)
	}

	@test()
	protected static async generatesTypedListenerWithEmitPayload() {
		const { contents, skill2 } =
			await this.setupSkillsInstallAtOrgRegisterEventContractAndGenerateListener(
				{
					emitPayloadSchema: buildEmitTargetAndPayloadSchema({
						eventName: 'my-new-event',
						targetSchema: eventTargetSchema,
						payloadSchema: {
							id: 'myNewEventEmitPayload',
							fields: {
								booleanField: {
									type: 'boolean',
								},
							},
						},
					}),
				}
			)

		assert.doesInclude(
			contents,
			'event: SpruceEvent<SkillEventContract, EmitPayload>'
		)

		assert.doesInclude(
			contents,
			`fullyQualifiedEventName: '${skill2.slug}.my-new-event::${this.expectedVersion}'`
		)
	}

	@test.only()
	protected static async emittingEventTriggersListenerAndCrashesWithListenerNotImplemented() {
		const { currentSkill, skill2, eventContract, org } =
			await this.setupSkillsInstallAtOrgRegisterEventContractAndGenerateListener(
				{
					emitPayloadSchema: buildEmitTargetAndPayloadSchema({
						eventName: 'my-new-event',
						targetSchema: {
							id: 'myNewEventEmitTarget',
							fields: {
								organizationId: {
									type: 'id',
									isRequired: true,
								},
							},
						},
						payloadSchema: {
							id: 'myNewEventEmitPayload',
							fields: {
								booleanField: {
									type: 'boolean',
								},
							},
						},
					}),
					responsePayloadSchema: buildSchema({
						id: 'myNewEventResponsePayload',
						fields: {
							booleanField: {
								type: 'boolean',
							},
						},
					}),
				}
			)

		const currentClient = await this.connectToApi({
			shouldAuthAsCurrentSkill: true,
		})

		await currentClient.disconnect()

		const boot = await this.Action('skill', 'boot').execute({ local: true })

		assert.isFalsy(boot.errors)

		//give the skill time to boot
		await this.wait(20000)

		const client = (await this.connectToApi({
			skillId: skill2.id,
			apiKey: skill2.apiKey,
		})) as any

		const eventName = `${skill2.slug}.my-new-event::${this.expectedVersion}`

		client.mixinContract({
			eventSignatures: {
				[eventName]:
					eventContract.eventSignatures[
						`my-new-event::${this.expectedVersion}`
					],
			},
		})

		let results: any

		do {
			await this.wait(5000)

			results = await client.emit(eventName, {
				target: {
					organizationId: org.id,
				},
				payload: {
					booleanField: true,
				},
			})
		} while (results.totalContracts < 1)

		assert.isEqual(results.totalContracts, 1)
		assert.isEqual(results.totalErrors, 1)
		assert.isEqual(results.totalResponses, 1)

		boot.meta?.promise?.catch((err: Error) => {
			assert.fail(err.stack)
		})

		await boot.meta?.kill()

		const error = assert.doesThrow(() =>
			eventResponseUtil.getFirstResponseOrThrow(results)
		)

		eventAssertUtil.assertError(error, 'LISTENER_NOT_IMPLEMENTED')

		const responderRef = results.responses[0].responderRef
		assert.isEqual(
			responderRef,
			`skill:${currentSkill.id}:${currentSkill.slug}`
		)
	}

	@test()
	protected static async listeningToAnEventWithNoEmitTargetOrPayloadGeneratesValidListener() {
		const { listenerPath } =
			await this.setupSkillsInstallAtOrgRegisterEventContractAndGenerateListener(
				{
					isGlobal: true,
					responsePayloadSchema: {
						id: 'test',
						fields: {
							id: {
								type: 'id',
							},
						},
					},
				}
			)

		await this.Service('typeChecker').check(listenerPath)
	}

	@test()
	protected static async hasIsGlobalCheck() {
		const match = await this.installEventsCreateListenerAndGetListenerMap()
		const contents = diskUtil.readFile(match)

		assert.doesInclude(
			contents,
			"isGlobal: require('../../listeners/skill/will-boot.v2020_01_01.listener').isGlobal,"
		)
	}

	private static async installAddDependencyExecuteAndWaitForInput(
		namespace: string
	) {
		await this.installEventFeature('events')

		this.addDependency(namespace)

		await this.executeAndWaitForInput()
		return this.ui.getLastInvocation()
	}

	private static async executeAndWaitForInput() {
		void this.listen.execute({}).then((results) => {
			if (results.errors) {
				this.ui.setError(results.errors[0])
			}
		})

		await this.waitForInput()
	}

	private static addDependency(namespace: string) {
		const dependencies = this.Service('dependency')
		dependencies.add({
			id: namespace,
			namespace,
		})
	}

	private static async installEventsAndCreateListener() {
		const cli = await this.installEventFeature('events')

		const version = 'v2020_01_01'

		const results = await this.listen.execute({
			namespace: 'skill',
			eventName: 'will-boot',
			version,
		})

		assert.isFalsy(results.errors)
		return { version, results, cli }
	}

	private static async setupSkillsInstallAtOrgRegisterEventContractAndGenerateListener(
		eventSignature: EventSignature
	) {
		const expectedVersion = this.expectedVersion

		const eventContract = {
			eventSignatures: {
				[`my-new-event::${expectedVersion}`]: eventSignature,
			},
		} as const

		const { skillFixture, skill2, currentSkill, cli, org } =
			await this.seedDummySkillRegisterCurrentSkillAndInstallToOrg()

		await skillFixture.registerEventContract(skill2, eventContract)

		this.Service('dependency').add({
			id: skill2.id,
			namespace: skill2.slug,
		})

		const results = await this.listen.execute({
			namespace: skill2.slug,
			eventName: `my-new-event`,
			version: expectedVersion,
		})

		assert.isFalsy(results.errors)

		const listener = testUtil.assertFileByNameInGeneratedFiles(
			`my-new-event.${expectedVersion}.listener.ts`,
			results.files
		)

		await this.Service('typeChecker').check(listener)

		const contents = diskUtil.readFile(listener)

		return {
			contents,
			skill2,
			listenerPath: listener,
			cli,
			eventContract,
			org,
			currentSkill,
		}
	}

	private static async installEventsCreateListenerAndGetListenerMap() {
		const { results } = await this.installEventsAndCreateListener()

		const match = testUtil.assertFileByNameInGeneratedFiles(
			`listeners.ts`,
			results.files
		)
		return match
	}
}
