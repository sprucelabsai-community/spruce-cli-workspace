import { eventDiskUtil, eventNameUtil } from '@sprucelabs/spruce-event-utils'
import {
	diskUtil,
	namesUtil,
	versionUtil,
} from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import { errorAssert } from '@sprucelabs/test-utils'
import { FeatureActionResponse } from '../../../features/features.types'
import AbstractEventTest from '../../../tests/AbstractEventTest'
import { DEMO_NUMBER_CREATING_AN_EVENT } from '../../../tests/constants'
import testUtil from '../../../tests/utilities/test.utility'
import uiAssert from '../../../tests/utilities/uiAssert.utility'
import { CliInterface, RegisteredSkill } from '../../../types/cli.types'
import actionUtil from '../../../utilities/action.utility'

const EVENT_NAME_READABLE = 'my fantastically amazing event'
const EVENT_NAME = 'my-fantastically-amazing-event'
const EVENT_CAMEL = 'myFantasticallyAmazingEvent'

export default class CreatingAnEventTest extends AbstractEventTest {
	private static readonly expectedVersion =
		versionUtil.generateVersion().constValue

	@test()
	protected static async hasCreateAction() {
		assert.isFunction(this.Action('event', 'create').execute)
	}

	@test()
	protected static async cantCreateEventWithoutBeingRegistered() {
		await this.FeatureFixture().installCachedFeatures('events')

		const results = await this.Action('event', 'create').execute({
			nameReadable: EVENT_NAME_READABLE,
			nameKebab: EVENT_NAME,
			nameCamel: EVENT_CAMEL,
			version: this.expectedVersion,
		})

		assert.isArray(results.errors)
		errorAssert.assertError(results.errors[0], 'SKILL_NOT_REGISTERED')
	}

	@test()
	protected static async createsPayloadBuildersAndSchemas() {
		const { results, skill } = await this.createEvent()

		const filesThatShouldExist = [
			new RegExp(
				`${namesUtil.toCamel(skill.slug)}.*?${
					this.expectedVersion
				}.*?myFantasticallyAmazingEventResponsePayload`,
				'gis'
			),
			new RegExp(
				`${namesUtil.toCamel(skill.slug)}.*?${
					this.expectedVersion
				}.*?myFantasticallyAmazingEventEmitTargetAndPayload`,
				'gis'
			),
			new RegExp(
				`${namesUtil.toCamel(skill.slug)}.*?${
					this.expectedVersion
				}.*?myFantasticallyAmazingEventEmitPayload`,
				'gis'
			),
			'emitPayload.builder.ts',
			'emitTarget.builder.ts',
		]

		const checker = this.Service('typeChecker')

		for (const name of filesThatShouldExist) {
			const match = testUtil.assertFileByPathInGeneratedFiles(
				name,
				results.files
			)
			await checker.check(match)
		}
	}

	@test()
	protected static async createsEventWithPayloadsPermissionsAndOptions() {
		const { results, cli, skill } = await this.createEvent()
		assert.isFalsy(results.errors)

		await this.copyEventBuildersAndPermissions(EVENT_NAME)

		const syncResults = await this.Action('event', 'sync').execute({})
		assert.isFalsy(syncResults.errors)

		const mixedResults = actionUtil.mergeActionResults(results, syncResults)

		await this.assertExpectedTargetAndPayload(mixedResults, skill)
		await this.assertExpectedPayloadSchemas(mixedResults)
		await this.assertReturnsEventFromHealthCheck(cli, skill)
		await this.createsExpectedPermissionContract(mixedResults)
		await this.assertCreatesOptionsFile(mixedResults)
	}

	@test()
	protected static async createdEventsAreTypedCorrectly() {
		const { results } = await this.createEvent()

		assert.isFalsy(results.errors)

		const { fqen } = results.meta ?? {}

		const testFileContents = diskUtil
			.readFile(this.resolveTestPath('client-test.ts.hbs'))
			.replace('{{fqen}}', fqen)

		const testFile = this.resolvePath('src', 'test-client.ts')
		diskUtil.writeFile(testFile, testFileContents)

		await this.Service('typeChecker').check(testFile)
	}

	@test()
	protected static async canReferenceSchemaFromOtherModule() {
		const { results } = await this.createEvent()
		await this.Service('pkg').install('@sprucelabs/heartwood-view-controllers')

		const emitPayloadFile = testUtil.assertFileByNameInGeneratedFiles(
			'emitPayload.builder.ts',
			results.files
		)

		const newContents = `import { formBuilderImportExportObjectSchema } from '@sprucelabs/heartwood-view-controllers'
import { buildSchema } from '@sprucelabs/schema'

const createFormEmitPayloadBuilder = buildSchema({
	id: 'myFantasticallyAmazingEventEmitPayload',
	fields: {
		...formBuilderImportExportObjectSchema.fields,
	},
})

export default createFormEmitPayloadBuilder
		`

		diskUtil.writeFile(emitPayloadFile, newContents)

		const syncResults = await this.Action('event', 'sync').execute({})

		assert.isFalsy(syncResults.errors)
	}

	@test()
	protected static async asksForVersionIfPreviousVersionExistsOnDifferentDay() {
		await this.createEvent({
			version: versionUtil.generateVersion('2020_01_10').constValue,
		})

		void this.Action('event', 'create').execute({
			nameReadable: EVENT_NAME_READABLE,
			nameKebab: EVENT_NAME,
			nameCamel: EVENT_CAMEL,
		})

		await uiAssert.assertRendersSelect(this.ui)

		this.ui.reset()
	}

	private static async createEvent(options?: { version?: string }) {
		const cli = await this.FeatureFixture().installCachedFeatures('events')

		const skill = await this.registerCurrentSkill()

		const results = await this.Action('event', 'create').execute({
			nameReadable: EVENT_NAME_READABLE,
			nameKebab: EVENT_NAME,
			nameCamel: EVENT_CAMEL,
			version: this.expectedVersion,
			...options,
		})

		return { results, cli, skill }
	}

	private static async registerCurrentSkill() {
		return await this.getSkillFixture().registerCurrentSkill(
			{
				name: 'my new skill',
			},
			{
				phone: DEMO_NUMBER_CREATING_AN_EVENT,
			}
		)
	}

	private static async assertCreatesOptionsFile(
		results: FeatureActionResponse
	) {
		const optionsFile = testUtil.assertFileByNameInGeneratedFiles(
			'event.options.ts',
			results.files
		)

		const imported = await this.Service('import').importDefault(optionsFile)

		assert.isEqualDeep(imported, { isGlobal: false })
	}

	private static async assertExpectedTargetAndPayload(
		results: FeatureActionResponse,
		skill: RegisteredSkill
	) {
		const match = testUtil.assertFileByPathInGeneratedFiles(
			new RegExp(
				`${namesUtil.toCamel(skill.slug)}.*?${
					this.expectedVersion
				}.*?myFantasticallyAmazingEventEmitTargetAndPayload`,
				'gis'
			),
			results.files
		)

		const schema = await this.Service('schema').importSchema(match)

		assert.isEqual(schema.id, 'myFantasticallyAmazingEventEmitTargetAndPayload')
		assert.isTruthy(schema.fields?.payload)
		assert.isTruthy(schema.fields?.target)
	}

	protected static async createsExpectedPermissionContract(results: any) {
		const builders = [
			{ filename: 'emitPermissions.builder.ts' },
			{ filename: 'listenPermissions.builder.ts' },
		]

		for (const builder of builders) {
			const { filename } = builder

			const match = testUtil.assertFileByNameInGeneratedFiles(
				filename,
				results.files
			)

			const path = versionUtil.resolvePath(
				this.cwd,
				'src/events/',
				EVENT_NAME,
				'{{@latest}}',
				filename
			)

			assert.isEqual(match, path)
			assert.isTrue(diskUtil.doesFileExist(path))
		}
	}

	private static async assertReturnsEventFromHealthCheck(
		cli: CliInterface,
		skill: RegisteredSkill
	) {
		const health = await cli.checkHealth()

		assert.isTruthy(health.event)
		assert.isLength(health.event.events, 1)

		const eventName = EVENT_NAME
		const eventNamespace = namesUtil.toKebab(skill.slug)

		assert.doesInclude(health.event.events, {
			eventName,
			eventNamespace,
			version: this.expectedVersion,
		})

		assert.doesInclude(health.event.contracts, {
			fullyQualifiedEventName: eventNameUtil.join({
				eventName,
				eventNamespace,
				version: this.expectedVersion,
			}),
		})
	}

	private static async assertExpectedPayloadSchemas(
		results: FeatureActionResponse
	) {
		const payloadSchemas = [
			{
				fileName: 'emitPayload.builder.ts',
				expectedId: 'myFantasticallyAmazingEventEmitPayload',
			},
			{
				fileName: 'emitTarget.builder.ts',
				expectedId: 'myFantasticallyAmazingEventEmitTarget',
			},
			{
				fileName: 'responsePayload.builder.ts',
				expectedId: 'myFantasticallyAmazingEventResponsePayload',
			},
		]

		const schemas = this.Service('schema')

		for (const payload of payloadSchemas) {
			const match = testUtil.assertFileByNameInGeneratedFiles(
				payload.fileName,
				results.files
			)

			assert.isEqual(
				match,
				eventDiskUtil.resolveEventPath(this.cwd + '/src/events', {
					fileName: payload.fileName as any,
					eventName: EVENT_NAME,
					version: this.expectedVersion,
				})
			)

			const imported = await schemas.importSchema(match)
			assert.isEqual(imported.id, payload.expectedId)
		}
	}
}
