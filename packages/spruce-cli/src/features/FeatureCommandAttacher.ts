import { Schema, SchemaEntityFactory } from '@sprucelabs/schema'
import { CommanderStatic } from 'commander'
import SpruceError from '../errors/SpruceError'
import PkgService from '../services/PkgService'
import { GraphicsInterface } from '../types/cli.types'
import commanderUtil from '../utilities/commander.utility'
import uiUtil from '../utilities/ui.utility'
import AbstractFeature from './AbstractFeature'
import ActionExecuter from './ActionExecuter'
import featuresUtil from './feature.utilities'
import { FeatureAction, FeatureActionResponse } from './features.types'

export default class FeatureCommandAttacher {
    private program: CommanderStatic['program']
    private ui: GraphicsInterface
    private actionExecuter: ActionExecuter
    private pkg: PkgService

    public constructor(options: {
        program: CommanderStatic['program']
        ui: GraphicsInterface
        actionExecuter: ActionExecuter
        pkgService: PkgService
    }) {
        const { program, ui: term, actionExecuter, pkgService } = options

        this.program = program
        this.ui = term
        this.pkg = pkgService
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
            this.clearAndRenderMasthead(action)

            const startTime = new Date().getTime()

            const options = commanderUtil.mapIncomingToOptions(
                ...args,
                feature.optionsSchema ?? action.optionsSchema
            )

            const results = await action.execute({
                ...options,
            })

            const endTime = new Date().getTime()
            const totalTime = endTime - startTime

            this.clearAndRenderResults({
                featureCode: feature.code,
                actionCode: code,
                totalTime,
                results,
                action,
            })

            return results as any
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

    private clearAndRenderResults(options: {
        namespace?: string
        featureCode: string
        actionCode: string
        totalTime: number
        action: FeatureAction
        results: FeatureActionResponse
    }) {
        const { featureCode, actionCode, results, totalTime, action } = options

        this.ui.stopLoading()
        this.ui.clear()

        this.ui.renderActionSummary({
            namespace: this.pkg.getSkillNamespace(),
            featureCode,
            actionCode,
            totalTime,
            action,
            ...results,
            headline: results.headline ?? `${actionCode} finished!`,
        })
    }

    private clearAndRenderMasthead(action: FeatureAction<Schema>) {
        uiUtil.renderActionMastHead(this.ui, action)
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
            } catch (err: any) {
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

export type OptionOverrides = Record<string, Record<string, any>>

export type BlockedCommands = Record<string, string>
