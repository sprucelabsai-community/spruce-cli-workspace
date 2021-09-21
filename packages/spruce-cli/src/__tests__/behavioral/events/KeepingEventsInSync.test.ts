import pathUtil from 'path'
import { coreEventContracts } from '@sprucelabs/mercury-core-events'
import {
	EventContract,
	SpruceSchemas,
	validateEventContract,
} from '@sprucelabs/mercury-types'
import { validateSchema } from '@sprucelabs/schema'
import {
	eventContractUtil,
	eventNameUtil,
} from '@sprucelabs/spruce-event-utils'
import {
	diskUtil,
	MERCURY_API_NAMESPACE,
	namesUtil,
} from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test'
import { FeatureActionResponse } from '../../../features/features.types'
import AbstractEventTest from '../../../tests/AbstractEventTest'

const coreContract = eventContractUtil.unifyContracts(
	coreEventContracts as any
) as SpruceSchemas.Mercury.v2020_12_25.EventContract

export default class KeepingEventsInSyncTest extends AbstractEventTest {
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
