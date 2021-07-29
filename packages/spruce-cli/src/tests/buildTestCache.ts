#!/usr/bin/env node
import { execSync } from 'child_process'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import FeatureFixture from '../fixtures/FeatureFixture'
import MercuryFixture from '../fixtures/MercuryFixture'
import TerminalInterface from '../interfaces/TerminalInterface'
import ImportService from '../services/ImportService'
import ServiceFactory from '../services/ServiceFactory'
import testUtil from '../tests/utilities/test.utility'
import { GraphicsTextEffect } from '../types/graphicsInterface.types'
import durationUtil from '../utilities/duration.utility'
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

async function run() {
	term.clear()

	if (process.env.WILL_BUILD_CACHE_SCRIPT) {
		term.renderLine('Running pre build cache script')
		execSync(process.env.WILL_BUILD_CACHE_SCRIPT)
	}

	term.renderHeadline(`Found ${testKeys.length} skills to cache.`)

	let messages: [string, any][] = []

	progressInterval =
		doesSupportColor &&
		setInterval(async () => {
			term.clear()
			term.renderDivider()
			term.renderLine(`Found ${testKeys.length} skills to cache.`)
			if (onlyInstall) {
				term.renderLine(
					`TEST_SKILLS_TO_CACHE=${process.env.TEST_SKILLS_TO_CACHE}.`
				)
			}
			term.renderDivider()
			term.renderLine(
				shouldRunSequentially ? 'Running sequentially' : 'Running in pararell'
			)

			for (const message of messages) {
				term.renderLine(message[0], message[1])
			}

			term.renderLine('')

			await term.startLoading(
				`${`Building ${remaining} skill${dropInS(
					remaining
				)}`}. ${durationUtil.msToFriendly(getTimeSpent())}`
			)
		}, 1000)

	function getTimeSpent() {
		const now = new Date().getTime()
		const delta = now - start
		return delta
	}

	function renderLine(message: any, effects?: any) {
		if (doesSupportColor) {
			messages.push([message, effects])
		} else {
			console.log(message)
		}
	}

	function renderWarning(message: any, effects?: any) {
		if (doesSupportColor) {
			messages.push([message, effects])
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
		for (const cacheKey of testKeys) {
			await cacheOrSkip(cacheKey)
		}
	} else {
		const promises = testKeys.map(async (cacheKey) => {
			while (totalSimultaneous >= maxSimultaneous) {
				await new Promise((resolve) => setTimeout(resolve, 1000))
			}
			totalSimultaneous++
			await cacheOrSkip(cacheKey)
			totalSimultaneous--
		})
		await Promise.all(promises)
	}

	clearInterval(progressInterval)

	await term.stopLoading()
	term.renderLine(`Done! ${durationUtil.msToFriendly(getTimeSpent())}`)

	async function cacheOrSkip(cacheKey: string) {
		const { cacheTracker, cwd, fixture, options } = setup(cacheKey)

		if (onlyInstall && onlyInstall.indexOf(cacheKey) === -1) {
			renderLine(`Skipping '${cacheKey}'.`)
			remaining--
		} else if (
			cacheTracker[cacheKey] &&
			diskUtil.doesDirExist(diskUtil.resolvePath(cwd, 'node_modules'))
		) {
			remaining--
			renderLine(`'${cacheKey}' already cached. Skipping...`, [
				GraphicsTextEffect.Italic,
			])
		} else {
			await cache(cwd, cacheKey, fixture, options)
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
		cwd: string,
		cacheKey: string,
		fixture: FeatureFixture,
		options: any
	) {
		if (diskUtil.doesDirExist(cwd)) {
			renderWarning(
				`Found cached '${cacheKey}', but deleted it since it was not in the cache tracker...`,
				[GraphicsTextEffect.Italic]
			)
			diskUtil.deleteDir(cwd)
		}

		renderLine(`Starting to build '${cacheKey}'...`, [GraphicsTextEffect.Green])

		await fixture.installFeatures(options, cacheKey)

		renderLine(
			`Done caching '${cacheKey}'. ${
				remaining - 1
			} remaining (${durationUtil.msToFriendly(getTimeSpent())})...`,
			[GraphicsTextEffect.Green, GraphicsTextEffect.Bold]
		)
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
	})
	.catch((err) => {
		term.renderError(err)
		if (progressInterval) {
			clearInterval(progressInterval)
		}
	})
