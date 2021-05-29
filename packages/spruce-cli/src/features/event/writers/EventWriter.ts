import pathUtil from 'path'
import { SchemaTemplateItem } from '@sprucelabs/schema'
import { eventDiskUtil } from '@sprucelabs/spruce-event-utils'
import {
	diskUtil,
	namesUtil,
	DEFAULT_SCHEMA_TYPES_FILENAME,
} from '@sprucelabs/spruce-skill-utils'
import {
	EventContractTemplateItem,
	EventListenerOptions,
} from '@sprucelabs/spruce-templates'
import { GeneratedFile } from '../../../types/cli.types'
import AbstractWriter from '../../../writers/AbstractWriter'

const CONTRACT_FILE_NAME = `events.contract.ts`
export default class EventWriter extends AbstractWriter {
	public async writeContracts(
		destinationDir: string,
		options: {
			eventContractTemplateItems: EventContractTemplateItem[]
			schemaTemplateItems: SchemaTemplateItem[]
			shouldImportCoreEvents?: boolean
			skillEventContractTypesFile: string
			eventBuilderFile: string
		}
	) {
		const { eventContractTemplateItems, shouldImportCoreEvents = true } =
			options

		const generated: Promise<GeneratedFile>[] = []

		for (const item of eventContractTemplateItems) {
			generated.push(
				this.writeContract({
					...options,
					destinationDir,
					eventContractTemplateItem: item,
				})
			)
		}

		generated.push(
			this.writeCombinedEvents({
				...options,
				shouldImportCoreEvents,
				destinationDir,
				templateItems: eventContractTemplateItems,
			})
		)

		const all = await Promise.all(generated)

		await this.lint(destinationDir)

		return all
	}

	private async writeContract(options: {
		destinationDir: string
		eventContractTemplateItem: EventContractTemplateItem
		schemaTemplateItems: SchemaTemplateItem[]
		eventBuilderFile: string
	}): Promise<GeneratedFile> {
		const { destinationDir, eventContractTemplateItem, schemaTemplateItems } =
			options

		const destinationFile = diskUtil.resolvePath(
			destinationDir,
			eventContractTemplateItem.namespaceCamel,
			generateEventContractFileName(eventContractTemplateItem)
		)

		const eventsContractContents = this.templates.eventContract({
			...options,
			...eventContractTemplateItem,
			schemaTemplateItems,
		})

		const results = await this.writeFileIfChangedMixinResults(
			destinationFile,
			eventsContractContents,
			`The event contract for ${
				Object.keys(eventContractTemplateItem.eventSignatures)[0]
			}`
		)

		return results[0]
	}

	private async writeCombinedEvents(options: {
		destinationDir: string
		templateItems: EventContractTemplateItem[]
		shouldImportCoreEvents?: boolean
		skillEventContractTypesFile: string
	}): Promise<GeneratedFile> {
		const { destinationDir } = options

		const destinationFile = diskUtil.resolvePath(
			destinationDir,
			CONTRACT_FILE_NAME
		)

		const contents = this.templates.combinedEventsContract(options)

		const results = await this.writeFileIfChangedMixinResults(
			destinationFile,
			contents,
			'All event contracts combined to a single export.'
		)

		return results[0]
	}

	public async writeListener(
		destinationDir: string,
		options: Omit<
			EventListenerOptions,
			'nameConst' | 'schemaTypesFile' | 'contractsFile'
		> & {
			version: string
			schemaTypesLookupDir: string
			contractDestinationDir: string
		}
	) {
		const {
			eventName,
			eventNamespace,
			version,
			schemaTypesLookupDir,
			contractDestinationDir,
		} = options

		const resolvedDestination = eventDiskUtil.resolveListenerPath(
			destinationDir,
			{
				eventName,
				eventNamespace,
				version,
			}
		)

		const relativeTypesFile = this.resolveSchemaTypesFile(
			schemaTypesLookupDir,
			resolvedDestination
		)

		const contractsFile = pathUtil.join(
			contractDestinationDir,
			CONTRACT_FILE_NAME.replace('.ts', '')
		)

		const listenerContents = this.templates.listener({
			...options,
			nameConst: namesUtil.toConst(`${eventNamespace}_${eventName}`),
			schemaTypesFile: relativeTypesFile,
			contractsFile,
		})

		const results = await this.writeFileIfChangedMixinResults(
			resolvedDestination,
			listenerContents,
			`Listener for ${eventNamespace}.${eventName}.`
		)

		await this.lint(resolvedDestination)

		return results
	}

	public async writeEvent(
		destinationDir: string,
		options: {
			nameCamel: string
			nameKebab: string
			version: string
			nameReadable: string
			isGlobal?: boolean
		}
	) {
		const {
			version,
			nameKebab,
			nameCamel,
			nameReadable,
			isGlobal = false,
		} = options

		const templates: ({
			context?: any
			templateMethod:
				| 'eventEmitPayload'
				| 'eventEmitTarget'
				| 'eventResponsePayload'
				| 'permissionContractBuilder'
				| 'eventOptions'
		} & Omit<GeneratedFile, 'path'>)[] = [
			{
				templateMethod: 'eventEmitPayload',
				name: 'emitPayload.builder.ts',
				action: 'generated',
				description: 'The payload that will be sent when you emit this event.',
			},
			{
				templateMethod: 'eventEmitTarget',
				name: 'emitTarget.builder.ts',
				action: 'generated',
				description: 'The target that will be sent when you emit this event.',
			},
			{
				templateMethod: 'eventResponsePayload',
				name: 'responsePayload.builder.ts',
				action: 'generated',
				description:
					'The payload that every listener will need to respond with. Delete this file for events that are fire and forget.',
			},
			{
				templateMethod: 'permissionContractBuilder',
				name: 'emitPermissions.builder.ts',
				action: 'generated',
				description: 'Permissions someone else will need to emit your event.',
				context: {
					nameCamel: nameCamel + 'Emit',
				},
			},
			{
				templateMethod: 'permissionContractBuilder',
				name: 'listenPermissions.builder.ts',
				action: 'generated',
				description:
					'Permissions someone else will need to listen to your event.',
				context: {
					nameCamel: nameCamel + 'Listen',
				},
			},
			{
				templateMethod: 'eventOptions',
				name: 'event.options.ts',
				action: 'generated',
				description: 'Extra options that can be set for your event',
				context: {
					isGlobal,
				},
			},
		]

		const files: GeneratedFile[] = []

		for (const file of templates) {
			const destination = eventDiskUtil.resolveEventPath(destinationDir, {
				fileName: file.name as any,
				eventName: nameKebab,
				version,
			})

			const contents = this.templates[file.templateMethod]({
				nameCamel,
				nameReadable,
				version,
				...file.context,
			})

			diskUtil.writeFile(destination, contents)

			files.push({
				...file,
				path: destination,
			})
		}

		await this.lint(destinationDir)

		return files
	}

	private resolveSchemaTypesFile(
		schemaTypesLookupDir: string,
		resolvedDestination: string
	) {
		const schemaTypesFile = pathUtil.join(
			schemaTypesLookupDir,
			DEFAULT_SCHEMA_TYPES_FILENAME
		)

		let relativeTypesFile = pathUtil.relative(
			pathUtil.dirname(resolvedDestination),
			schemaTypesFile
		)

		relativeTypesFile = relativeTypesFile.replace(
			pathUtil.extname(relativeTypesFile),
			''
		)

		return relativeTypesFile
	}
}

export function generateEventContractFileName(options: {
	nameCamel: string
	version: string
}): string {
	return `${options.nameCamel}.${options.version}.contract.ts`
}
