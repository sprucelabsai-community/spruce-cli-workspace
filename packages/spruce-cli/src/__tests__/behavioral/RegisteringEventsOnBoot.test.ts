import {
	eventContractUtil,
	eventNameUtil,
} from '@sprucelabs/spruce-event-utils'
import { namesUtil, versionUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test'
import EventStore from '../../features/event/stores/EventStore'
import AbstractEventTest from '../../tests/AbstractEventTest'

const EVENT_NAME_READABLE = 'did book appointment'
const EVENT_NAME = 'did-book-appointment'
const EVENT_CAMEL = 'didBookAppointment'

export default class RegisteringEventsOnBootTest extends AbstractEventTest {
	protected static async beforeEach() {
		await super.beforeEach()

		await this.getPersonFixture().loginAsDemoPerson(
			process.env.DEMO_NUMBER_EVENTS_ON_BOOT
		)
	}

	@test()
	protected static async registeringEventsOnBoot() {
		const { skill2, currentSkill } =
			await this.seedDummySkillRegisterCurrentSkillAndInstallToOrg()

		await this.Action('event', 'create').execute({
			nameReadable: EVENT_NAME_READABLE,
			nameKebab: EVENT_NAME,
			nameCamel: EVENT_CAMEL,
		})

		await this.copyEventBuildersAndPermissions(EVENT_NAME)

		await this.Action('event', 'sync').execute({})

		const boot = await this.Action('skill', 'boot').execute({ local: true })

		const client = await this.connectToApi({
			skillId: skill2.id,
			apiKey: skill2.apiKey,
		})

		EventStore.clearCache()

		const contractResults = await this.Store('event', {
			apiClientFactory: async () => client,
		}).fetchEventContracts()

		const contracts = contractResults.contracts

		boot.meta?.kill()

		const version = versionUtil.generateVersion().constValue
		const name = eventNameUtil.join({
			eventNamespace: currentSkill.slug,
			eventName: EVENT_NAME,
			version,
		})

		assert.isTrue(contracts.length >= 2)

		const namespace = namesUtil.toPascal(currentSkill.slug)
		const sig = eventContractUtil.getSignatureByName(contracts[1], name)

		assert.isEqualDeep(sig, {
			emitPayloadSchema: {
				id: 'didBookAppointmentEmitTargetAndPayload',
				version,
				namespace,
				name: '',
				fields: {
					target: {
						type: 'schema',
						isRequired: true,
						options: {
							schema: {
								id: 'myFantasticallyAmazingEventEmitTarget',
								version,
								namespace,
								name: '',
								fields: { tacoId: { type: 'id', isRequired: true } },
							},
						},
					},
					payload: {
						type: 'schema',
						isRequired: true,
						options: {
							schema: {
								id: 'myFantasticallyAmazingEventEmitPayload',
								version,
								namespace,
								name: '',
								fields: { aRequiredField: { type: 'text', isRequired: true } },
							},
						},
					},
				},
			},
			responsePayloadSchema: {
				id: 'myFantasticallyAmazingEventResponsePayload',
				version,
				namespace,
				name: '',
				fields: { anotherRequiredField: { type: 'text', isRequired: true } },
			},
			emitPermissionContract: {
				id: 'myFantasticallyAmazingEventEmitPermissions',
				name: 'my fantastically amazing event',
				requireAllPermissions: false,
				permissions: [
					{
						id: 'can-high-five',
						name: 'Can give high five',
						description: 'Will this person be allowed to high five?',
						requireAllStatuses: false,
					},
				],
			},
			listenPermissionContract: {
				id: 'myFantasticallyAmazingEventListenPermissions',
				name: 'my fantastically amazing event',
				requireAllPermissions: false,
				permissions: [
					{
						id: 'can-high-five',
						name: 'Can give high five',
						description: 'Will this person be allowed to high five?',
						requireAllStatuses: false,
					},
				],
			},
		})
	}
}
