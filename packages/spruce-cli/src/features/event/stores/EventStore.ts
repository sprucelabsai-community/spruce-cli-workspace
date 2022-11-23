import pathUtil from 'path'
import {
	EventContract,
	EventSignature,
	PermissionContract,
	SpruceSchemas,
	validateEventContract,
} from '@sprucelabs/mercury-types'
import { Schema, validateSchema } from '@sprucelabs/schema'
import {
	eventResponseUtil,
	eventDiskUtil,
	eventNameUtil,
	buildEmitTargetAndPayloadSchema,
	eventContractUtil,
} from '@sprucelabs/spruce-event-utils'
import { diskUtil, namesUtil } from '@sprucelabs/spruce-skill-utils'
import globby from 'globby'
import { cloneDeep } from 'lodash'
import SpruceError from '../../../errors/SpruceError'
import AbstractStore from '../../../stores/AbstractStore'
import { InternalUpdateHandler } from '../../../types/cli.types'
import { eventContractCleanerUtil } from '../../../utilities/eventContractCleaner.utility'

export default class EventStore extends AbstractStore {
	public name = 'event'
	protected static contractCache: Record<string, any> = {}
	private static localEventCache?: SpruceSchemas.Mercury.v2020_12_25.EventContract

	public static clearCache() {
		EventStore.localEventCache = undefined
		EventStore.contractCache = {}
	}

	public async fetchEventContracts(
		options?: FetchContractsOptions
	): Promise<EventStoreFetchEventContractsResponse> {
		const { localNamespace, didUpdateHandler, namespaces } = options ?? {}

		didUpdateHandler?.('Pulling remote contracts...')

		let contracts
		try {
			contracts = await this.fetchRemoteContracts(namespaces)
		} catch (err: any) {
			const error = err.options.responseErrors?.[0] ?? err
			throw error
		}

		const localContract =
			localNamespace &&
			(await this.loadLocalContract(localNamespace, didUpdateHandler))

		if (localNamespace) {
			this.filterOutLocalEventsFromRemoteContractsMutating(
				contracts,
				localNamespace
			)
		}

		if (localContract) {
			contracts.push(localContract)
		}

		return {
			contracts,
			errors: [],
		}
	}

	private async fetchRemoteContracts(namespaces?: string[]) {
		const key = namespaces?.join('|') ?? '_'

		if (!EventStore.contractCache[key]) {
			const client = await this.connectToApi({ shouldAuthAsCurrentSkill: true })

			const [{ contracts }] = await client.emitAndFlattenResponses(
				'get-event-contracts::v2020_12_25',
				{
					target: {
						namespaces,
					},
				}
			)

			EventStore.contractCache[key] = contracts
		}

		return cloneDeep(EventStore.contractCache[key])
	}

	private filterOutLocalEventsFromRemoteContractsMutating(
		remoteContracts: EventContract[],
		localNamespace: string
	) {
		const ns = namesUtil.toKebab(localNamespace)

		for (const contract of remoteContracts) {
			const sigs = eventContractUtil.getNamedEventSignatures(contract)
			for (const sig of sigs) {
				if (sig.eventNamespace === ns) {
					delete contract.eventSignatures[sig.fullyQualifiedEventName]
				}
			}
		}
	}

	public async loadLocalContract(
		localNamespace: string,
		didUpdateHandler?: InternalUpdateHandler
	): Promise<EventContract | null> {
		if (EventStore.localEventCache) {
			return EventStore.localEventCache
		}

		const localMatches = await globby(this.generateGlobbyForLocalEvents())

		const ns = namesUtil.toKebab(localNamespace)
		const eventSignatures: Record<string, EventSignature> = {}
		const filesByFqenAndEventKey: {
			fqen: string
			isSchema: boolean
			match: string
			eventKey: string
		}[] = []

		didUpdateHandler?.(
			`Importing ${localMatches.length} local event signature files...`
		)

		await Promise.all(
			localMatches.map(async (match) => {
				let fqen: string | undefined
				let eventKey: keyof EventImport | undefined

				try {
					const { eventName, version } = eventDiskUtil.splitPathToEvent(match)
					fqen = eventNameUtil.join({
						eventName,
						version,
						eventNamespace: ns,
					})

					const filename = pathUtil.basename(
						match
					) as keyof typeof eventFileNamesImportKeyMap

					const map = eventFileNamesImportKeyMap[filename]

					if (map) {
						//@ts-ignore
						eventKey = map.key

						filesByFqenAndEventKey.push({
							fqen,
							isSchema: map.isSchema,
							match,
							eventKey: eventKey as string,
						})
					}
				} catch (err: any) {
					throw new SpruceError({
						code: 'INVALID_EVENT_CONTRACT',
						fullyQualifiedEventName: fqen ?? 'Bad event name',
						brokenProperty: eventKey ?? '*** major failure ***',
						originalError: err,
					})
				}
			})
		)

		const matches = filesByFqenAndEventKey.map((o) => o.match)
		const importsInOrder = (await this.Service('import').bulkImport(
			matches
		)) as Record<string, any>[]
		const importsByName: Record<string, EventImport> = {}

		for (let idx = 0; idx < filesByFqenAndEventKey.length; idx++) {
			const imported = importsInOrder[idx]
			const { fqen, eventKey, isSchema } = filesByFqenAndEventKey[idx]

			if (isSchema) {
				try {
					validateSchema(imported)
				} catch (err: any) {
					throw new SpruceError({
						code: 'INVALID_EVENT_CONTRACT',
						fullyQualifiedEventName: fqen,
						brokenProperty: eventKey,
						originalError: err,
					})
				}
			}

			if (!importsByName[fqen]) {
				importsByName[fqen] = {}
			}

			//@ts-ignore
			importsByName[fqen][eventKey] = imported
		}

		Object.keys(importsByName).forEach((fqen) => {
			const imported = importsByName[fqen]
			const { eventName } = eventNameUtil.split(fqen)
			eventSignatures[fqen] = {
				emitPayloadSchema: buildEmitTargetAndPayloadSchema({
					eventName,
					payloadSchema: imported.emitPayload,
					targetSchema: imported.emitTarget,
				}),
				responsePayloadSchema: imported.responsePayload,
				emitPermissionContract: imported.emitPermissions,
				listenPermissionContract: imported.listenPermissions,
				...imported.options,
			}
		})

		didUpdateHandler?.(
			`Loaded ${Object.keys(eventSignatures).length} local event signatures...`
		)

		if (Object.keys(eventSignatures).length > 0) {
			const cleaned = eventContractCleanerUtil.cleanPayloadsAndPermissions({
				eventSignatures,
			})

			validateEventContract(cleaned)

			EventStore.localEventCache = cleaned

			return cleaned
		}

		return null
	}

	private generateGlobbyForLocalEvents(): string | readonly string[] {
		return diskUtil.resolvePath(
			this.cwd,
			'src',
			'**',
			'events',
			'**/*.(builder|options).ts'
		)
	}

	public async registerEventContract(options: {
		eventContract: EventContract
	}) {
		const client = await this.connectToApi({ shouldAuthAsCurrentSkill: true })

		const results = await client.emit('register-events::v2020_12_25', {
			payload: {
				contract: options.eventContract,
			},
		})

		eventResponseUtil.getFirstResponseOrThrow(results)

		EventStore.contractCache = {}

		return results
	}

	public async unRegisterEvents(
		options: SpruceSchemas.Mercury.v2020_12_25.UnregisterEventsEmitPayload
	) {
		const client = await this.connectToApi({ shouldAuthAsCurrentSkill: true })

		const results = await client.emit('unregister-events::v2020_12_25', {
			payload: options,
		})

		eventResponseUtil.getFirstResponseOrThrow(results)

		EventStore.contractCache = {}
	}
}

export interface EventStoreFetchEventContractsResponse {
	errors: SpruceError[]
	contracts: EventContract[]
}

type Options = Omit<
	EventSignature,
	| 'responsePayloadSchema'
	| 'emitPayloadSchema'
	| 'listenPermissionContract'
	| 'emitPermissionContract'
>

interface EventImport {
	options?: Options
	emitPayload?: Schema
	emitTarget?: Schema
	responsePayload?: Schema
	emitPermissions?: PermissionContract
	listenPermissions?: PermissionContract
}

const eventFileNamesImportKeyMap = {
	'event.options.ts': { key: 'options', isSchema: false },
	'emitPayload.builder.ts': { key: 'emitPayload', isSchema: true },
	'emitTarget.builder.ts': { key: 'emitTarget', isSchema: true },
	'responsePayload.builder.ts': { key: 'responsePayload', isSchema: true },
	'emitPermissions.builder.ts': { key: 'emitPermissions', isSchema: false },
	'listenPermissions.builder.ts': { key: 'listenPermissions', isSchema: false },
}

export interface FetchContractsOptions {
	localNamespace?: string
	namespaces?: string[]
	didUpdateHandler?: InternalUpdateHandler
}
