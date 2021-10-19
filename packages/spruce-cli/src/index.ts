#!/usr/bin/env node

import { run } from './cli'
import TerminalInterface from './interfaces/TerminalInterface'

require('dotenv').config()

run(process.argv)
	.then((results: any) => {
		process.exitCode = results?.errors?.length > 0 ? 1 : 0
	})
	.catch((err) => {
		const term = new TerminalInterface(
			process.cwd(),
			process.env.CLI_RENDER_STACK_TRACES !== 'false'
		)
		term.renderError(err)
		process.exitCode = 1
	})
