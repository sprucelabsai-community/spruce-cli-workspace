import osUtil from 'os'
import CliGlobalEmitter from '../GlobalEmitter'
import TerminalInterface from '../interfaces/TerminalInterface'
import ServiceFactory from '../services/ServiceFactory'
import StoreFactory from '../stores/StoreFactory'
import * as demoNumbersByName from '../tests/constants'
import MercuryFixture from './fixtures/MercuryFixture'
import OrganizationFixture from './fixtures/OrganizationFixture'
import PersonFixture from './fixtures/PersonFixture'
import SkillFixture from './fixtures/SkillFixture'

const demoNumbers = Object.values(demoNumbersByName)

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

		try {
			term.renderLine('Deleting skills')
			const totalSkills = await skillFixture.clearAllSkills()
			term.renderLine(`${totalSkills} deleted`)
		} catch (err: any) {
			console.error(err.stack ?? err.message)
		}
	}

	await mercuryFixture.disconnectAll()
}

void run()
	.then(() => {
		term.renderLine('Done cleaning up!')
	})
	.catch((err) => {
		term.renderError(err)
		process.exit(1)
	})
