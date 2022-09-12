import os from 'os'
import pathUtil from 'path'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { assert } from '@sprucelabs/test-utils'
import { GeneratedFile } from '../../types/cli.types'
import durationUtil from '../../utilities/duration.utility'
require('dotenv').config()

function hasArg(regex: RegExp) {
	return !!process.argv?.find((arg) => arg.search(regex) > -1)
}

const testUtil = {
	shouldClearCache() {
		return hasArg(/clear.*?cache/gi)
	},
	isCacheEnabled() {
		return !hasArg(/no.*?cache/gi)
	},

	resolveTestDir(cacheKey = '') {
		return diskUtil.resolvePath(this.getTestRootDir(), 'spruce-cli', cacheKey)
	},

	shouldCleanupTestSkillDirs() {
		return process.env.CLEANUP_TEST_SKILL_DIRS !== 'false'
	},

	getTestRootDir() {
		return process.env.TEST_CACHE_ROOT_DIR ?? pathUtil.join(os.tmpdir())
	},

	assertCountsByAction(
		files: GeneratedFile[] | undefined,
		options: {
			generated: number
			updated: number
			skipped: number
		}
	) {
		const generated = (files ?? []).filter(
			(f) => f.action === 'generated'
		).length
		const updated = (files ?? []).filter((f) => f.action === 'updated').length
		const skipped = (files ?? []).filter((f) => f.action === 'skipped').length

		assert.isEqual(
			generated,
			options.generated,
			`Generated the wrong number of files. Got ${generated} but expected ${options.generated}.`
		)

		assert.isEqual(
			updated,
			options.updated,
			`Updated the wrong number of files. Got ${updated} but expected ${options.updated}.`
		)

		assert.isEqual(
			skipped,
			options.skipped,
			`Skipped the wrong number of files. Got ${skipped} but expected ${options.skipped}.`
		)
	},

	assertFileByNameInGeneratedFiles(
		name: string | RegExp,
		files: GeneratedFile[] | undefined
	): string {
		const file = (files ?? []).find((f) => f.name.search(name) > -1)?.path
		assert.isTruthy(
			file,
			`file named '${name}' not found in generated files.\n\n${JSON.stringify(
				files ?? [],
				null,
				2
			)}`
		)

		return file
	},

	assertFileByPathInGeneratedFiles(
		path: string | RegExp,
		files: GeneratedFile[] | undefined
	): string {
		const file = (files ?? []).find((f) => f.path.search(path) > -1)?.path
		assert.isTruthy(
			file,
			`file with path '${path}' not found in generated files.\n\n${JSON.stringify(
				files ?? [],
				null,
				2
			)}`
		)

		return file
	},

	startTime: 0,
	startLogTimer() {
		this.startTime = new Date().getTime()
	},

	log(...args: any[]) {
		//@ts-ignore
		const prefix = global.activeTest
			? //@ts-ignore
			  `${global.activeTest?.file}::${global.activeTest?.test} :: `
			: ''

		if (process.env.TEST_LOG_FILTER) {
			const match = prefix.search(
				new RegExp(process.env.TEST_LOG_FILTER, 'igm')
			)
			if (match < 0) {
				return
			}
		}

		process.stderr.write(
			prefix + this.getTimeSpentFormatted() + ': ' + args.join(' ')
		)
	},

	getTimeSpent() {
		const now = new Date().getTime()
		const delta = now - this.startTime
		return delta
	},

	getTimeSpentFormatted() {
		const spent = this.getTimeSpent()
		return durationUtil.msToFriendly(spent)
	},
}

export default testUtil
