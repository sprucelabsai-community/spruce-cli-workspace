import {
	eventContractUtil,
	eventNameUtil,
} from '@sprucelabs/spruce-event-utils'
import { namesUtil, versionUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import AbstractEventTest from '../../../tests/AbstractEventTest'
import { DEMO_NUMBER_EVENTS_ON_BOOT } from '../../../tests/constants'

const EVENT_NAME_READABLE = 'did book appointment'
const EVENT_NAME = 'did-book-appointment'
const EVENT_CAMEL = 'didBookAppointment'

export default class RegisteringEventsOnBootTest extends AbstractEventTest {
	protected static async beforeEach() {
		await super.beforeEach()
		await this.people.loginAsDemoPerson(DEMO_NUMBER_EVENTS_ON_BOOT)
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

		const { contracts } = await this.Store('event', {
			apiClientFactory: async () => client,
		}).fetchEventContracts()

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

		assert.doesInclude(sig.emitPayloadSchema, {
			id: 'didBookAppointmentEmitTargetAndPayload',
			version,
			namespace,
		})

		assert.doesInclude(sig.responsePayloadSchema, {
			id: 'myFantasticallyAmazingEventResponsePayload',
			version,
			namespace,
		})
	}
}
