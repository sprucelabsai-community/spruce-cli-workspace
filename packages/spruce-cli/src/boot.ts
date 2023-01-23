import { MercuryClientFactory } from '@sprucelabs/mercury-client'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { Command } from 'commander'
import './addons/filePrompt.addon'
import Cli from './Cli-1'
import { CLI_HERO } from './constants'
import { FeatureInstallerImpl } from './features/FeatureInstaller'
import InFlightEntertainment from './InFlightEntertainment'
import TerminalInterface from './interfaces/TerminalInterface'
import CommandService from './services/CommandService'

export async function run(argv: string[] = []): Promise<void> {
	const program = new Command()
	let cwd = process.cwd()

	program.storeOptionsAsProperties(false)
	program.option('--no-color', 'Disable color output in the console')
	program.option(
		'-d, --directory <path>',
		'The working directory to execute the command'
	)
	program.option('-v, --version', 'The version of the cli')

	const dirIdx = process.argv.findIndex(
		(v) => v === '--directory' || v === '-d'
	)

	if (dirIdx > -1) {
		const dir = process.argv[dirIdx + 1]
		const newCwd = diskUtil.resolvePath(cwd, dir)
		cwd = newCwd
	}

	const terminal = new TerminalInterface(
		cwd,
		process.env.CLI_RENDER_STACK_TRACES !== 'false'
	)
	terminal.clear()
	terminal.renderHero(CLI_HERO)

	const isAskingForVersion =
		process.argv.findIndex((v) => v === '--version' || v === '-v') > -1

	if (isAskingForVersion) {
		const json = require('../package.json')
		terminal.renderHeadline(`Version ${json.version}`)
		return
	}

	await Cli.Boot({
		program,
		cwd,
		host: process.env.HOST,
		graphicsInterface: terminal,
	})

	await setupInFlightEntertainment(terminal)

	const command = await program.parseAsync(argv)

	//@ts-ignore
	const results = await command._actionResults[0]

	for (const client of MercuryClientFactory.getClients()) {
		await client.disconnect()
	}

	return results
}

async function setupInFlightEntertainment(ui: TerminalInterface) {
	if (
		TerminalInterface.doesSupportColor() &&
		process.env.ENABLE_INSTALL_ENTERTAINMENT !== 'false'
	) {
		const command = new CommandService(diskUtil.resolvePath(__dirname, '../'))
		InFlightEntertainment.setup({ command, ui })

		FeatureInstallerImpl.startInFlightIntertainmentHandler = (
			didUpdateHandler
		) => {
			InFlightEntertainment.start()
			didUpdateHandler((message) => {
				InFlightEntertainment.writeStatus(message)
			})
		}

		FeatureInstallerImpl.stopInFlightIntertainmentHandler = () => {
			InFlightEntertainment.stop()
		}
	}
}
