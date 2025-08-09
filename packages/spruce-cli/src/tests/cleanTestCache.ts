#!/usr/bin/env node

import { execSync } from 'child_process'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import dotenv from 'dotenv'
import TerminalInterface from '../interfaces/TerminalInterface'
import testUtil from '../tests/utilities/test.utility'
import { GraphicsTextEffect } from '../types/graphicsInterface.types'
dotenv.config({ quiet: true })

const term = new TerminalInterface(__dirname)

const dir = testUtil.resolveTestDir()

if (process.env.CLEAN_CACHE_SCRIPT) {
    term.renderHeadline('Running CLEAN_CACHE_SCRIPT')
    execSync(process.env.CLEAN_CACHE_SCRIPT)
} else {
    term.renderHeadline(`Clearing test cache at ${dir}.`)
    diskUtil.deleteDir(dir)
}

term.renderLine('Test cache cleared!', [GraphicsTextEffect.Green])
