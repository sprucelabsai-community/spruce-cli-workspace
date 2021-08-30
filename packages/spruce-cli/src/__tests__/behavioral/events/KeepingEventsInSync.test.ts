import pathUtil from 'path'
import {
	buildPermissionContract,
	coreEventContracts,
	EventContract,
	EventSignature,
	SpruceSchemas,
	validateEventContract,
} from '@sprucelabs/mercury-types'
import { validateSchema } from '@sprucelabs/schema'
import {
	buildEmitTargetAndPayloadSchema,
	eventContractUtil,
	eventNameUtil,
	eventTargetSchema,
} from '@sprucelabs/spruce-event-utils'
import {
	diskUtil,
	MERCURY_API_NAMESPACE,
	namesUtil,
	versionUtil,
} from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test'
import EventStore from '../../../features/event/stores/EventStore'
import { generateEventContractFileName } from '../../../features/event/writers/EventWriter'
import { FeatureActionResponse } from '../../../features/features.types'
import AbstractEventTest from '../../../tests/AbstractEventTest'
import testUtil from '../../../tests/utilities/test.utility'
import { RegisteredSkill } from '../../../types/cli.types'

const coreContract = eventContractUtil.unifyContracts(
	coreEventContracts as any
) as SpruceSchemas.Mercury.v2020_12_25.EventContract

const EVENT_NAME_READABLE = 'my permission amazing event'
const EVENT_NAME = 'my-permission-amazing-event'
const EVENT_CAMEL = 'myPermissionAmazingEvent'

export default class KeepingEventsInSyncTest extends AbstractEventTest {
	private static randomVersion = 'v2020_01_01'

	private static get todaysVersion() {
		return versionUtil.generateVersion()
	}

	private static get eventContractPath() {
		return this.resolveHashSprucePath('events', 'events.contract.ts')
	}

	@test()
	protected static async hasSyncEventsAction() {
		await this.Cli()
		assert.isFunction(this.Action('event', 'sync').execute)
	}

	@test()
	protected static async syncsWithoutSavingCoreEventsByDefault() {
		await this.FeatureFixture().installCachedFeatures('eventsInNodeModule')

		const results = await this.skipInstallSkillPrompts(() =>
			this.Action('event', 'sync').execute({})
		)

		await this.assertValidSyncEventsResults(results)
	}

	@test()
	protected static async mergesGlobalEvents() {
		await this.FeatureFixture().installCachedFeatures('events')

		const skills = this.getSkillFixture()
		await skills.registerCurrentSkill({
			name: 'events in sync skill',
		})

		const skill2 = await skills.seedDemoSkill({ name: 'a temp skill' })

		await skills.registerEventContract(skill2, {
			eventSignatures: {
				'test-sync::v2021_01_01': {
					isGlobal: true,
				},
			},
		})

		const results = await this.Action('event', 'sync').execute({})

		await this.assertValidSyncEventsResults(results)

		const fqen = eventNameUtil.join({
			eventName: 'test-sync',
			version: 'v2021_01_01',
			eventNamespace: skill2.slug,
		})
		await this.assertGlobalEventsAreTyped(fqen)
	}

	@test()
	protected static async canSetSkillEventContractTypesFile() {
		await this.FeatureFixture().installCachedFeatures('eventsInNodeModule')

		await this.skipInstallSkillPrompts(() =>
			this.Action('event', 'sync').execute({
				skillEventContractTypesFile: 'testy test',
			})
		)

		const contents = diskUtil.readFile(this.eventContractPath)
		assert.doesInclude(contents, `declare module 'testy test'`)
	}

	@test()
	protected static async canSyncOnlyCoreEvents() {
		await this.FeatureFixture().installCachedFeatures('eventsInNodeModule')

		const promise = this.syncCoreEventsPretendingToBeMercuryTypes()

		await this.skipInstallSkillPrompts()

		const results = await promise

		await this.assertValidSyncEventsResults(results, true)
	}

	@test()
	protected static async syncingSchemasDoesNotSyncEventSchemasIfEventsHaveNeverBeenSynced() {
		const cli = await this.FeatureFixture().installCachedFeatures('events')
		const event = cli.getFeature('event')
		let wasHit = false

		//@ts-ignore
		event.getEventContractBuilder = () => {
			wasHit = true
		}

		const results = await this.Action('schema', 'sync').execute({})

		this.assertCoreEventContractsSavedToDisk(false)
		this.assertCorePayloadSchemasAreCreated(results, false)

		assert.isFalse(wasHit)
		assert.isFalse(diskUtil.doesFileExist(this.eventContractPath))
	}

	@test()
	protected static async syncingSchemaAfterSyncEventsSyncsSchemasAndDoesNotWriteCoreEvents() {
		const cli = await this.FeatureFixture().installCachedFeatures('events')

		await this.Action('event', 'sync').execute({})

		const event = cli.getFeature('event')
		let wasHit = false

		const oldGetter = event.getEventContractBuilder.bind(event)

		//@ts-ignore
		event.getEventContractBuilder = () => {
			wasHit = true
			return oldGetter()
		}

		const results = await this.Action('schema', 'sync').execute({})

		assert.isTrue(wasHit)

		await this.assertValidSyncSchemasResults(results, false)
	}

	@test()
	protected static async syncingSchemasAfterSyncingCoreEventsSavesCoreEvents() {
		await this.FeatureFixture().installCachedFeatures('events')

		await this.syncCoreEventsPretendingToBeMercuryTypes()

		const results = await this.Action('schema', 'sync').execute({})
		await this.assertValidSyncSchemasResults(results, true)
	}

	@test()
	protected static async syncingSchemasWithBrokenConnectionStopsWithError() {
		await this.FeatureFixture().installCachedFeatures('events')

		await this.syncCoreEventsPretendingToBeMercuryTypes()

		const results = await this.Action('schema', 'sync').execute({})

		const match = testUtil.assertFileByNameInGeneratedFiles(
			'sendMessageEmitPayload.schema.ts',
			results.files
		)

		assert.isTrue(diskUtil.doesFileExist(match))

		const client = await this.getMercuryFixture().connectToApi({
			shouldAuthAsCurrentSkill: true,
		})
		await client.disconnect()

		EventStore.clearCache()

		const results2 = await this.Action('schema', 'sync').execute({})

		assert.isTruthy(results2.errors)

		assert.isTrue(diskUtil.doesFileExist(match))
	}

	@test()
	protected static async syncingSchemasDoesNotSyncEventSchemasIfEventsNotInstalled() {
		await this.FeatureFixture().installCachedFeatures('schemas')
		const results = await this.Action('schema', 'sync').execute({})

		assert.doesThrow(() => this.assertCorePayloadSchemasAreCreated(results))
	}

	@test()
	protected static async canGetNumberOfEventsBackFromHealthCheck() {
		const cli = await this.FeatureFixture().installCachedFeatures('events')

		const results = await this.Action('event', 'sync').execute({})

		assert.isFalsy(results.errors)

		await this.Service('build').build()

		const health = await cli.checkHealth({ isRunningLocally: false })

		assert.isTruthy(health.skill)
		assert.isFalsy(health.skill.errors)
		assert.isTruthy(health.event)
		assert.isEqual(health.event.status, 'passed')
		assert.isTruthy(health.event.contracts)

		assert.isAbove(health.event.contracts.length, 0)
	}

	@test()
	protected static async syncsEventsFromOtherSkills() {
		const { skillFixture, skill2 } =
			await this.seedDummySkillRegisterCurrentSkillAndInstallToOrg()

		const eventName = `my-new-event::${this.todaysVersion.constValue}`
		const fqen = `${skill2.slug}.my-new-event::${this.todaysVersion.constValue}`

		await skillFixture.registerEventContract(skill2, {
			eventSignatures: {
				[eventName]: {
					emitPayloadSchema: buildEmitTargetAndPayloadSchema({
						eventName: 'my-new-event',
						targetSchema: eventTargetSchema,
						payloadSchema: {
							id: 'myNewEventEmitPayloadId',
							fields: { onlyField: { type: 'text' } },
						},
					}),
					responsePayloadSchema: {
						id: 'myNewEventResponsePayloadId',
						fields: {},
					},
					emitPermissionContract: buildPermissionContract({
						id: 'myNewEventEmitPermissionContract',
						name: 'My new event emit permissionContract',
						permissions: [
							{
								id: 'can-emit',
								name: 'Can emit my new event',
							},
						],
					}),
					listenPermissionContract: buildPermissionContract({
						id: 'myNewEventListenPermissionContract',
						name: 'My new event listen permissionContract',
						permissions: [
							{
								id: 'can-listen',
								name: 'Can emit my new event',
							},
						],
					}),
				},
			},
		})

		const results = await this.Action('event', 'sync').execute({})

		const match = testUtil.assertFileByNameInGeneratedFiles(
			`myNewEvent.${this.todaysVersion.dirValue}.contract.ts`,
			results.files
		)

		assert.doesInclude(
			match,
			`${namesUtil.toCamel(skill2.slug)}${pathUtil.sep}myNewEvent.${
				this.todaysVersion.dirValue
			}.contract.ts`
		)

		const contract = (await this.Service('import').importDefault(match)) as any
		const sig = eventContractUtil.getSignatureByName(contract, fqen)

		assert.isTruthy(sig.emitPayloadSchema)
		assert.isTruthy(
			//@ts-ignore
			sig.emitPayloadSchema.fields?.payload?.options?.schema?.id,
			'myNewEventEmitPayloadId'
		)
		assert.isTruthy(
			sig.responsePayloadSchema?.id,
			'myNewEventResponsePayloadId'
		)

		assert.isTruthy(sig.emitPermissionContract)
		assert.isEqual(
			sig.emitPermissionContract.id,
			'myNewEventEmitPermissionContract'
		)
		assert.isEqual(sig.emitPermissionContract.permissions[0].id, 'can-emit')
		assert.isTruthy(sig.listenPermissionContract)
		assert.isEqual(
			sig.listenPermissionContract.id,
			'myNewEventListenPermissionContract'
		)
		assert.isEqual(sig.listenPermissionContract.permissions[0].id, 'can-listen')
	}

	@test()
	protected static async twoSkillsWithSameEventCanBeSynced() {
		const { skill2, skillFixture, orgFixture, org } =
			await this.seedDummySkillRegisterCurrentSkillAndInstallToOrg()

		const skill3 = await skillFixture.seedDemoSkill({ name: 'a third skill' })

		await orgFixture.installSkillAtOrganization(skill3.id, org.id)

		const eventName = `my-new-event::${this.todaysVersion.constValue}`

		await skillFixture.registerEventContract(skill2, {
			eventSignatures: {
				[eventName]: {
					emitPayloadSchema: buildEmitTargetAndPayloadSchema({
						eventName: 'my-new-event',
						targetSchema: eventTargetSchema,
					}),
				},
			},
		})

		await skillFixture.registerEventContract(skill3, {
			eventSignatures: {
				[eventName]: {
					emitPayloadSchema: buildEmitTargetAndPayloadSchema({
						eventName: 'my-new-event',
						targetSchema: eventTargetSchema,
					}),
				},
			},
		})

		const results = await this.Action('event', 'sync').execute({})

		const contract = testUtil.assertFileByNameInGeneratedFiles(
			'events.contract.ts',
			results.files
		)

		await this.Service('typeChecker').check(contract)
	}

	@test()
	protected static async skillWithSameEventNameButDifferentVersionsCanBeSynced() {
		const { skill2, skillFixture } =
			await this.seedDummySkillRegisterCurrentSkillAndInstallToOrg()

		const eventName = `my-new-event::${this.todaysVersion.constValue}`
		const eventName2 = `my-new-event::${this.randomVersion}`

		await skillFixture.registerEventContract(skill2, {
			eventSignatures: {
				[eventName]: {
					emitPayloadSchema: buildEmitTargetAndPayloadSchema({
						eventName: 'my-new-event',
						targetSchema: eventTargetSchema,
					}),
				},
				[eventName2]: {
					emitPayloadSchema: buildEmitTargetAndPayloadSchema({
						eventName: 'my-new-event',
						targetSchema: eventTargetSchema,
					}),
				},
			},
		})

		const results = await this.Action('event', 'sync').execute({})

		const contract = testUtil.assertFileByNameInGeneratedFiles(
			'events.contract.ts',
			results.files
		)

		await this.Service('typeChecker').check(contract)
	}

	@test()
	protected static async unRegisteredEventsAreRemoved() {
		const { skillFixture, syncResults, skill2, contractFileName } =
			await this.seedSkillsAndRegisterAndSyncEvents()

		await this.assertValidActionResponseFiles(syncResults)

		await skillFixture.unRegisterEvents(skill2, {
			shouldUnregisterAll: true,
		})

		const eventContract = testUtil.assertFileByNameInGeneratedFiles(
			contractFileName,
			syncResults.files
		)

		assert.isTrue(diskUtil.doesFileExist(eventContract))

		await this.Action('event', 'sync').execute({})

		assert.isFalse(diskUtil.doesFileExist(eventContract))

		const dirname = pathUtil.dirname(eventContract)
		assert.isFalse(diskUtil.doesDirExist(dirname))
	}

	@test()
	protected static async emptyPermissionsAreNotAddedToContract() {
		await this.registerCurrentSkillAndInstallToOrg()

		const results = await this.Action('event', 'create').execute({
			nameReadable: EVENT_NAME_READABLE,
			nameKebab: EVENT_NAME,
			nameCamel: EVENT_CAMEL,
		})

		for (const file of [
			'emitPermissions.builder.ts',
			'listenPermissions.builder.ts',
		]) {
			const perms = testUtil.assertFileByNameInGeneratedFiles(
				file,
				results.files
			)

			diskUtil.writeFile(
				perms,
				`import {
				buildPermissionContract
			} from '@sprucelabs/mercury-types'
			
			const myFantasticallyAmazingEventEmitPermissions = buildPermissionContract({
				id: 'myFantasticallyAmazingEventEmitPermissions',
				name: 'my fantastically amazing event',
				description: undefined,
				requireAllPermissions: false,
				permissions: []
			})
			
			export default myFantasticallyAmazingEventEmitPermissions
			`
			)
		}

		const syncResults = await this.Action('event', 'sync').execute({})

		const contractFile = testUtil.assertFileByNameInGeneratedFiles(
			/myPermissionAmazingEvent\..*?\.contract\.ts/,
			syncResults.files
		)

		const contract = (await this.Service('import').importDefault(
			contractFile
		)) as EventContract

		const fqen = Object.keys(contract.eventSignatures)[0]
		assert.isFalsy(contract.eventSignatures[fqen].emitPermissionContract)
		assert.isFalsy(contract.eventSignatures[fqen].listenPermissionContract)
	}

	private static async syncCoreEventsPretendingToBeMercuryTypes() {
		const results = await this.Action('event', 'sync').execute({
			shouldSyncOnlyCoreEvents: true,
			eventBuilderFile: '../../../builder',
			skillEventContractTypesFile: '../../builder',
		})

		const builder = `
export function buildEventContract(..._: any[]):any { return _[0] }
export function buildPermissionContract(..._: any[]):any { return _[0] }
`

		diskUtil.writeFile(this.resolvePath('src', 'builder.ts'), builder)
		await this.Service('pkg').uninstall([
			'@sprucelabs/mercury-types',
			'@sprucelabs/mercury-client',
			'@sprucelabs/spruce-event-utils',
			'@sprucelabs/spruce-event-plugin',
		])
		return results
	}

	private static async assertValidSyncEventsResults(
		results: FeatureActionResponse,
		shouldSyncOnlyCoreEvents = false
	) {
		assert.isFalsy(results.errors)

		await this.assertValidSyncSchemasResults(results, shouldSyncOnlyCoreEvents)
	}

	private static async assertGlobalEventsAreTyped(eventName: string) {
		const contents = diskUtil.readFile(this.eventContractPath)

		assert.doesInclude(contents, `'${eventName}':`)
	}

	private static async assertValidSyncSchemasResults(
		results: FeatureActionResponse,
		shouldSyncOnlyCoreEvents: boolean
	) {
		assert.isFalsy(results.errors)

		this.assertCoreEventContractsSavedToDisk(shouldSyncOnlyCoreEvents)
		this.assertCorePayloadSchemasAreCreated(results, shouldSyncOnlyCoreEvents)

		await this.assertEventsHavePayloads(results)
		await this.assertCombinedContractContents()

		const coreContractContents = diskUtil.readFile(this.eventContractPath)
		const search = `did-message::v2020_12_25': MercuryDidMessageEventContract_v2020_12_25['eventSignatures']['did-message::v2020_12_25']`

		if (shouldSyncOnlyCoreEvents) {
			assert.doesInclude(coreContractContents, search)
		} else {
			assert.doesNotInclude(coreContractContents, search)
		}
	}

	private static async seedSkillsAndRegisterAndSyncEvents(
		signature?: EventSignature
	) {
		const { skill2, skillFixture, cli } =
			await this.seedDummySkillRegisterCurrentSkillAndInstallToOrg()

		const { results, filename } = await this.registerEventAndSync(
			skill2,
			signature
		)

		return {
			skillFixture,
			syncResults: results,
			cli,
			skill2,
			contractFileName: filename,
		}
	}

	private static async registerEventAndSync(
		skill: RegisteredSkill,
		signature?: EventSignature
	) {
		const skillFixture = this.getSkillFixture()
		const stamp = new Date().getTime()
		const eventName = `cleanup-event-test-${stamp}::${this.todaysVersion.constValue}`
		const filename = generateEventContractFileName({
			nameCamel: `cleanupEventTest${stamp}`,
			version: this.todaysVersion.constValue,
		})

		await skillFixture.registerEventContract(skill, {
			eventSignatures: {
				[eventName]: {
					emitPayloadSchema: buildEmitTargetAndPayloadSchema({
						eventName,
						targetSchema: eventTargetSchema,
					}),
					...signature,
				},
			},
		})

		const results = await this.Action('event', 'sync').execute({})
		return { results, filename }
	}

	private static async assertCombinedContractContents() {
		const imported = await this.importCombinedContractsFile()

		assert.isTruthy(imported)
		assert.isArray(imported)

		const localContract = eventContractUtil.unifyContracts(imported)
		assert.isTruthy(localContract)

		const sigs = eventContractUtil.getNamedEventSignatures(coreContract)

		for (const sig of sigs) {
			eventContractUtil.getSignatureByName(
				localContract,
				sig.fullyQualifiedEventName
			)
		}
	}

	private static async importCombinedContractsFile(): Promise<EventContract[]> {
		const eventContractsFile = this.eventContractPath

		// hack import to bring types in when importing contract file
		if (
			diskUtil.doesDirExist(
				this.resolvePath('node_modules/@sprucelabs/mercury-types')
			)
		) {
			const contents = diskUtil.readFile(eventContractsFile)
			diskUtil.writeFile(
				eventContractsFile,
				`import '@sprucelabs/mercury-types'\n${contents}`
			)
		}

		const imported: EventContract[] = await this.Service(
			'import'
		).importDefault(eventContractsFile)

		return imported
	}

	private static async assertEventsHavePayloads(
		results: FeatureActionResponse,
		eventName = 'authenticate'
	) {
		const imported = await this.importCombinedContractsFile()
		const contract = eventContractUtil.unifyContracts(imported)

		assert.isTruthy(contract)

		validateEventContract(contract)

		const signature = eventContractUtil.getSignatureByName(contract, eventName)

		assert.isTruthy(signature.emitPayloadSchema)
		validateSchema(signature.emitPayloadSchema)

		assert.isTruthy(signature.responsePayloadSchema)
		validateSchema(signature.responsePayloadSchema)
	}

	private static assertCorePayloadSchemasAreCreated(
		results: FeatureActionResponse,
		shouldHaveWritten = true
	) {
		const filesToCheck = [
			{
				name: `unregisterListenersEmitTargetAndPayload.schema.ts`,
				path: `schemas${pathUtil.sep}${MERCURY_API_NAMESPACE}`,
			},
		]

		this.assertFilesWereGenerated(filesToCheck, results, shouldHaveWritten)
	}

	private static assertFilesWereGenerated(
		filesToCheck: { name: string; path: string }[],
		results: FeatureActionResponse,
		shouldHaveWritten = true
	) {
		for (const file of filesToCheck) {
			const expected = this.resolveHashSprucePath(
				'schemas/mercury/v2020_12_25',
				file.name
			)
			const doesExist = diskUtil.doesFileExist(expected)

			if (shouldHaveWritten) {
				assert.isTrue(doesExist, `Expected to find ${file} on the filesystem.`)
			} else {
				assert.isFalse(doesExist, `Should not have written ${file}.`)
			}
		}
	}

	private static assertCoreEventContractsSavedToDisk(shouldHaveWritten = true) {
		const sigs = eventContractUtil.getNamedEventSignatures(coreContract)

		for (const sig of sigs) {
			const expected = this.resolveHashSprucePath(
				`events/mercury/${namesUtil.toCamel(
					sig.eventName
				)}.v2020_12_25.contract.ts`
			)
			const doesExist = diskUtil.doesFileExist(expected)

			if (shouldHaveWritten) {
				assert.isTrue(doesExist, `Expected to write a file ${expected}.`)
			} else {
				assert.isFalse(
					doesExist,
					`Generated contract for ${sig.fullyQualifiedEventName} and it should not have because it's a core contract.`
				)
			}
		}
	}
}
