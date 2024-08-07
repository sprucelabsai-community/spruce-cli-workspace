#!/usr/bin/env node

import { run } from './boot'
import TerminalInterface from './interfaces/TerminalInterface'

require('dotenv').config()

run(process.argv)
    .then((results: any) => {
        const code = results?.errors?.length > 0 ? 1 : 0
        process.exit(code)
    })
    .catch((err) => {
        const term = new TerminalInterface(
            process.cwd(),
            process.env.CLI_RENDER_STACK_TRACES !== 'false'
        )
        term.renderError(err)
        process.exit(1)
    })
