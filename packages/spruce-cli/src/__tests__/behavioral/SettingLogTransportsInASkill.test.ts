import { diskUtil, namesUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test'
import { errorAssertUtil } from '@sprucelabs/test-utils'
import LintService from '../../services/LintService'
import AbstractSkillTest from '../../tests/AbstractSkillTest'
import testUtil from '../../tests/utilities/test.utility'

export default class SettingLogTransportsInASkillTest extends AbstractSkillTest {
	protected static skillCacheKey = 'skills'

	@test()
	protected static async hasCreateTransportCommand() {
		const action = this.Action('log', 'createTransport')
		assert.isFunction(action.execute)
	}

	@test()
	protected static async needsNameOfTransport() {
		const results = await this.createTransport()
		assert.isFalsy(results.errors)
	}

	@test('can create transport 1', 'Sms')
	@test('can create transport 2', 'Email')
	protected static async createsTransportFile(nameReadable: string) {
		const results = await this.createTransport(nameReadable)
		const nameCamel = namesUtil.toCamel(nameReadable)
		const match = testUtil.assertFileByNameInGeneratedFiles(
			`${nameCamel}Transport.plugin.ts`,
			results.files
		)

		assert.doesInclude(
			match,
			this.resolvePath('src/logTransports', `${nameCamel}Transport.plugin.ts`)
		)

		assert.isTrue(diskUtil.doesFileExist(match))
	}

	@test()
	protected static async cantCreateTransportThatAlreadyExists() {
		const results = await this.createTransport('Slack')
		assert.isTruthy(results.errors)
		errorAssertUtil.assertError(results.errors[0], 'TRANSPORT_ALREADY_EXISTS', {
			name: 'Slack',
		})
	}

	@test()
	protected static async logsWriteToTransports() {
		LintService.enableLinting()
		const transportContents = `
		import { diskUtil, Level, LogTransport } from '@sprucelabs/spruce-skill-utils'
		
		export default function (): {
			levels: Level[]
			transport: LogTransport
		} | null {
			return {
				levels: ['ERROR', 'INFO', 'WARN'],
				transport: (...messageParts: string[]) => {
					const message = messageParts.join(' ')
					diskUtil.writeFile(
						diskUtil.resolvePath(__dirname, '..', '..', 'log.txt'),
						message
					)
				},
			}
		}
		`

		await this.createTransportWithContents(transportContents, 'File')
		await this.Service('build').build()

		const boot = await this.Action('skill', 'boot').execute({})

		await boot.meta?.kill()

		assert.isTrue(
			diskUtil.doesFileExist(diskUtil.resolvePath(this.cwd, 'log.txt'))
		)
	}

	private static async createTransportWithContents(
		transportContents: string,
		nameReadable: string
	) {
		const results = await this.createTransport(nameReadable)
		const match = testUtil.assertFileByNameInGeneratedFiles(
			`${namesUtil.toCamel(nameReadable)}Transport.plugin.ts`,
			results.files
		)

		diskUtil.writeFile(match, transportContents)
	}

	private static async createTransport(nameReadable = 'Slack') {
		const action = this.Action('log', 'createTransport')
		const results = await action.execute({
			nameReadable,
			nameCamel: namesUtil.toCamel(nameReadable),
		})
		return results
	}
}
