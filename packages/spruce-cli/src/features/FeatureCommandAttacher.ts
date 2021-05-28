import { Schema, SchemaEntityFactory } from '@sprucelabs/schema'
import { CommanderStatic } from 'commander'
import { CLI_HERO } from '../constants'
import SpruceError from '../errors/SpruceError'
import { GraphicsInterface } from '../types/cli.types'
import commanderUtil from '../utilities/commander.utility'
import AbstractFeature from './AbstractFeature'
import ActionExecuter from './ActionExecuter'
import featuresUtil from './feature.utilities'
import { FeatureAction, FeatureActionResponse } from './features.types'

export interface OptionOverrides {
	[command: string]: Record<string, any>
}

export interface BlockedCommands {
	[command: string]: string
}

export default class FeatureCommandAttacher {
	private program: CommanderStatic['program']
	private ui: GraphicsInterface
	private optionOverrides: OptionOverrides
	private blockedCommands: BlockedCommands
	private actionExecuter: ActionExecuter

	public constructor(options: {
		program: CommanderStatic['program']
		ui: GraphicsInterface
		optionOverrides: OptionOverrides
		blockedCommands: BlockedCommands
		actionExecuter: ActionExecuter
	}) {
		const {
			program,
			ui: term,
			optionOverrides,
			blockedCommands,
			actionExecuter,
		} = options

		this.program = program
		this.ui = term
		this.optionOverrides = optionOverrides
		this.blockedCommands = blockedCommands
		this.actionExecuter = actionExecuter
	}

	public async attachFeature(feature: AbstractFeature) {
		const actionCodes = await feature.getAvailableActionCodes()

		for (const actionCode of actionCodes) {
			this.attachCode(actionCode, feature)
		}
	}

	private attachCode(code: string, feature: AbstractFeature) {
		let commandStr = featuresUtil.generateCommand(feature.code, code)
		const action = this.actionExecuter.Action(feature.code, code)

		const aliases = action.commandAliases ? [...action.commandAliases] : []

		if (aliases.length > 0) {
			commandStr = aliases.shift() as string
		}

		let command = this.program.command(commandStr)

		if (aliases.length > 0) {
			command = command.aliases(aliases)
		}

		command = command.action(async (...args: any[]) => {
			this.assertCommandIsNotBlocked(commandStr)
			this.clearAndRenderHeadline(action)

			const startTime = new Date().getTime()

			const options = commanderUtil.mapIncomingToOptions(
				...args,
				feature.optionsSchema ?? action.optionsSchema
			)

			const overrides = this.optionOverrides[commandStr]
			if (overrides) {
				this.ui.renderLine(`Overrides found in package.json`)
				this.ui.renderObject(overrides)
			}

			const results = await action.execute({
				...options,
				...overrides,
			})

			const endTime = new Date().getTime()
			const totalTime = endTime - startTime

			this.clearAndReanderResults({
				featureCode: feature.code,
				actionCode: code,
				totalTime,
				results,
			})
		})

		const description = action.optionsSchema?.description

		if (description) {
			command = command.description(description)
		}

		const schema = action.optionsSchema

		if (schema) {
			this.attachOptions(command, schema)
		}
	}

	private clearAndReanderResults(options: {
		featureCode: string
		actionCode: string
		totalTime: number
		results: FeatureActionResponse
	}) {
		const { featureCode, actionCode, results, totalTime } = options

		this.ui.stopLoading()
		this.ui.clear()

		this.ui.renderCommandSummary({
			headline: `${actionCode} finished!`,
			featureCode,
			actionCode,
			totalTime,
			...results,
		})
	}

	private clearAndRenderHeadline(action: FeatureAction<Schema>) {
		this.ui.clear()
		this.ui.renderHero(CLI_HERO)
		this.ui.renderHeadline(action.invocationMessage)
	}

	private assertCommandIsNotBlocked(commandStr: string) {
		if (this.blockedCommands[commandStr]) {
			throw new SpruceError({
				code: 'COMMAND_BLOCKED',
				command: commandStr,
				hint: this.blockedCommands[commandStr],
			})
		}
	}

	private attachOptions(command: CommanderStatic['program'], schema: Schema) {
		const entity = SchemaEntityFactory.Entity(schema)

		let theProgram = command

		const fields = entity.getNamedFields()
		const aliases = featuresUtil.generateOptionAliases(schema)

		fields.forEach(({ field, name }) => {
			try {
				theProgram = theProgram.option(
					aliases[name],
					field.hint,
					field.definition.defaultValue
						? `${field.definition.defaultValue}`
						: undefined
				)
			} catch (err) {
				throw new SpruceError({
					//@ts-ignore
					code: 'FAILED_TO_ATTACH_COMMAND',
					fieldName: name,
					id: entity.schemaId,
					originalError: err,
					friendlyMessage: `Could not attach option ${aliases[name]} from ${entity.schemaId}.${name} to the command`,
				})
			}
		})
	}
}
