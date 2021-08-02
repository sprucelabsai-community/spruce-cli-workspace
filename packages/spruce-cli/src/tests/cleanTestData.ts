import osUtil from 'os'
import CliGlobalEmitter from '../GlobalEmitter'
import TerminalInterface from '../interfaces/TerminalInterface'
import ServiceFactory from '../services/ServiceFactory'
import StoreFactory from '../stores/StoreFactory'
import MercuryFixture from './fixtures/MercuryFixture'
import OrganizationFixture from './fixtures/OrganizationFixture'
import PersonFixture from './fixtures/PersonFixture'
import SkillFixture from './fixtures/SkillFixture'

require('dotenv').config()

const DEMO_NUMBER = process.env.DEMO_NUMBER
const DEMO_NUMBER_LOGIN_AS_SKILL = process.env.DEMO_NUMBER_LOGIN_AS_SKILL
const DEMO_NUMBER_INSTALL_SKILL = process.env.DEMO_NUMBER_INSTALL_SKILL
const SANDBOX_DEMO_NUMBER = process.env.SANDBOX_DEMO_NUMBER
const DEMO_NUMBER_GLOBAL_EVENTS = process.env.DEMO_NUMBER_GLOBAL_EVENTS
const DEMO_NUMBER_EVENTS_ON_BOOT = process.env.DEMO_NUMBER_EVENTS_ON_BOOT
const DEMO_NUMBER_VIEWS_ON_BOOT = process.env.DEMO_NUMBER_VIEWS_ON_BOOT

const demoNumbers = [
	DEMO_NUMBER,
	DEMO_NUMBER_LOGIN_AS_SKILL,
	DEMO_NUMBER_INSTALL_SKILL,
	DEMO_NUMBER_GLOBAL_EVENTS,
	SANDBOX_DEMO_NUMBER,
	DEMO_NUMBER_EVENTS_ON_BOOT,
	DEMO_NUMBER_VIEWS_ON_BOOT,
]

const cwd = process.cwd()
const term = new TerminalInterface(cwd, true)

async function run() {
	term.renderHeadline(
		`Starting cleanup for ${demoNumbers.length} demo numbers.`
	)

	const serviceFactory = new ServiceFactory()
	const mercuryFixture = new MercuryFixture(cwd, serviceFactory)
	const apiClientFactory = mercuryFixture.getApiClientFactory()
	const storeFactory = new StoreFactory({
		cwd,
		serviceFactory,
		homeDir: osUtil.homedir(),
		emitter: CliGlobalEmitter.Emitter(),
		apiClientFactory,
	})

	const personFixture = new PersonFixture(apiClientFactory)
	const orgFixture = new OrganizationFixture(personFixture, storeFactory)
	const skillFixture = new SkillFixture(
		personFixture,
		storeFactory,
		apiClientFactory
	)

	for (const number of demoNumbers) {
		term.renderLine(`Starting cleanup for ${number}`)
		term.renderLine(`Logging in...`)

		await personFixture.loginAsDemoPerson(number)

		term.renderLine(`Success`)

		term.renderLine(`Deleting organizations`)
		const totalOrgs = await orgFixture.clearAllOrgs()
		term.renderLine(`${totalOrgs} orgs deleted`)

		term.renderLine('Deleting skills')
		const totalSkills = await skillFixture.clearAllSkills()
		term.renderLine(`${totalSkills} deleted`)
	}

	await mercuryFixture.disconnectAll()
}

void run()
	.then(() => {
		term.renderLine('Done cleaning up!')
	})
	.catch((err) => {
		term.renderError(err)
	})
