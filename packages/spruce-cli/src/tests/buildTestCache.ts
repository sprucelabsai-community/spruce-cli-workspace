#!/usr/bin/env node
import { execSync } from 'child_process'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import TerminalInterface from '../interfaces/TerminalInterface'
import ImportService from '../services/ImportService'
import ServiceFactory from '../services/ServiceFactory'
import testUtil from '../tests/utilities/test.utility'
import { GraphicsTextEffect } from '../types/graphicsInterface.types'
import durationUtil from '../utilities/duration.utility'
import FeatureFixture from './fixtures/FeatureFixture'
import MercuryFixture from './fixtures/MercuryFixture'
require('dotenv').config()

const packageJsonContents = diskUtil.readFile(
	diskUtil.resolvePath(__dirname, '..', '..', 'package.json')
)

const packageJson = JSON.parse(packageJsonContents)
const { testSkillCache } = packageJson
const testKeys = Object.keys(testSkillCache)

let remaining = testKeys.length
const term = new TerminalInterface(__dirname, true)
const start = new Date().getTime()
const testSkillsToCache =
	process.env.TEST_SKILLS_TO_CACHE === '*'
		? undefined
		: process.env.TEST_SKILLS_TO_CACHE
const onlyInstall = testSkillsToCache?.split(',').map((t) => t.trim()) as
	| string[]
	| undefined

const shouldRunSequentially = !!process.argv.find(
	(a) => a === '--shouldRunSequentially=true' || a === '--shouldRunSequentially'
)
const maxSimultaneous = process.env.MAX_SIMULTANEOUS_SKILL_CACHERS ?? 10
let totalSimultaneous = 0
let progressInterval: any
const doesSupportColor = TerminalInterface.doesSupportColor()

let didMessagesChange = true

async function run() {
	term.clear()

	if (process.env.WILL_BUILD_CACHE_SCRIPT) {
		term.renderLine('Running pre build cache script')
		execSync(process.env.WILL_BUILD_CACHE_SCRIPT)
	}

	term.renderHeadline(`Found ${testKeys.length} skills to cache.`)

	let messages: [string, any][] = []

	const render = async () => {
		if (didMessagesChange) {
			term.moveCursorTo(0, 6)

			for (const message of messages) {
				term.eraseLine()
				term.renderLine(message[0], message[1])
			}

			await term.stopLoading()

			term.eraseLine()
			term.renderLine('')
		}

		didMessagesChange = false

		await term.startLoading(
			`${`Building ${remaining} skill${dropInS(
				remaining
			)}`}. ${durationUtil.msToFriendly(getTimeSpent())}`
		)

		term.clearBelowCursor()
	}

	progressInterval = doesSupportColor && setInterval(render, 1000)

	function getTimeSpent() {
		const now = new Date().getTime()
		const delta = now - start
		return delta
	}

	function renderLine(lineNum: number, message: any, effects?: any) {
		if (doesSupportColor) {
			didMessagesChange = true
			messages[lineNum] = [message, effects]
			void render()
		} else {
			console.log(message)
		}
	}

	function renderWarning(lineNum: number, message: any, effects?: any) {
		if (doesSupportColor) {
			didMessagesChange = true
			messages[lineNum] = [message, effects]
			void render()
		} else {
			console.log(message)
		}
	}

	if (doesSupportColor) {
		await term.startLoading(
			`Building ${remaining} remaining skill${dropInS(remaining)}...`
		)
	}

	if (shouldRunSequentially) {
		await Promise.all(
			testKeys.map((cacheKey, idx) => cacheOrSkip(idx, cacheKey))
		)
	} else {
		const promises = testKeys.map(async (cacheKey, idx) => {
			while (totalSimultaneous >= maxSimultaneous) {
				await new Promise((resolve) => setTimeout(resolve, 1000))
			}
			totalSimultaneous++
			await cacheOrSkip(idx, cacheKey)
			totalSimultaneous--
		})

		await Promise.all(promises)
	}

	await term.stopLoading()
	term.renderLine(`Done! ${durationUtil.msToFriendly(getTimeSpent())}`)

	async function cacheOrSkip(lineNum: number, cacheKey: string) {
		const { cacheTracker, cwd, fixture, options } = setup(cacheKey)

		if (onlyInstall && onlyInstall.indexOf(cacheKey) === -1) {
			renderLine(lineNum, `Skipping '${cacheKey}'.`, [
				GraphicsTextEffect.Yellow,
			])
			remaining--
		} else if (
			cacheTracker[cacheKey] &&
			diskUtil.doesDirExist(diskUtil.resolvePath(cwd, 'node_modules'))
		) {
			remaining--
			renderLine(lineNum, `'${cacheKey}' already cached. Skipping...`, [
				GraphicsTextEffect.Italic,
			])
		} else {
			await cache(lineNum, cwd, cacheKey, fixture, options)
			remaining--
		}
	}

	function setup(cacheKey: string) {
		const options = testSkillCache[cacheKey]

		const importCacheDir = testUtil.resolveTestDir('spruce-cli-import-cache')
		ImportService.setCacheDir(importCacheDir)

		const serviceFactory = new ServiceFactory()
		const cwd = testUtil.resolveTestDir(cacheKey)

		const mercuryFixture = new MercuryFixture(cwd, serviceFactory)
		const fixture = new FeatureFixture({
			cwd,
			serviceFactory,
			ui: new TerminalInterface(cwd),
			shouldGenerateCacheIfMissing: true,
			apiClientFactory: mercuryFixture.getApiClientFactory(),
		})

		const cacheTracker = fixture.loadCacheTracker()
		return { cacheTracker, cwd, fixture, options }
	}

	async function cache(
		lineNum: number,
		cwd: string,
		cacheKey: string,
		fixture: FeatureFixture,
		options: any
	) {
		if (diskUtil.doesDirExist(cwd)) {
			renderWarning(
				lineNum,
				`Found cached '${cacheKey}', but deleted it since it was not in the cache tracker...`,
				[GraphicsTextEffect.Italic]
			)
			diskUtil.deleteDir(cwd)
		}

		renderLine(lineNum, `Starting to build '${cacheKey}'...`, [
			GraphicsTextEffect.Green,
		])

		try {
			await fixture.installFeatures(options, cacheKey)
			renderLine(
				lineNum,
				`Done caching '${cacheKey}'. ${
					remaining - 1
				} remaining (${durationUtil.msToFriendly(getTimeSpent())})...`,
				[GraphicsTextEffect.Green, GraphicsTextEffect.Bold]
			)
		} catch (err: any) {
			renderLine(lineNum, `Error caching '${cacheKey}'...`, [
				GraphicsTextEffect.Red,
				GraphicsTextEffect.Bold,
			])

			renderLine(lineNum, `Error caching ${cacheKey}:\n\n${err.stack}`)
		}
	}
}

function dropInS(remaining: number) {
	return remaining === 1 ? '' : 's'
}

void run()
	.then(() => {
		if (process.env.DID_BUILD_CACHE_SCRIPT) {
			term.renderLine('Running pre build cache script')
			execSync(process.env.DID_BUILD_CACHE_SCRIPT)
		}
		if (progressInterval) {
			clearInterval(progressInterval)
		}
	})
	.catch((err) => {
		term.renderError(err)
		if (progressInterval) {
			clearInterval(progressInterval)
		}
	})
