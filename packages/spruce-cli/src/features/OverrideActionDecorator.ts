import { GraphicsInterface } from '@sprucelabs/spruce-skill-utils'
import SpruceError from '../errors/SpruceError'
import { FeatureAction } from '../features/features.types'
import { BlockedCommands, OptionOverrides } from '../types/cli.types'
import AbstractFeature from './AbstractFeature'
import featuresUtil from './feature.utilities'

const methodDelegator = {
    getAllFuncs(toCheck: any) {
        const props = []
        let obj = toCheck
        do {
            props.push(...Object.getOwnPropertyNames(obj))
        } while ((obj = Object.getPrototypeOf(obj)))

        return props.sort().filter((e: any, i: any, arr: any) => {
            return e != arr[i + 1] && typeof toCheck[e] == 'function'
        })
    },

    delegateFunctionCalls(from: any, to: any) {
        const props = this.getAllFuncs(to)
        for (const prop of props) {
            //@ts-ignore
            if (!from[prop]) {
                //@ts-ignore
                from[prop] = (...args: []) => {
                    //@ts-ignore
                    return to[prop](...args)
                }
            }
        }
    },
}

export default class OverrideActionDecorator implements FeatureAction {
    private blockedCommands?: BlockedCommands
    private optionOverrides?: OptionOverrides
    private ui?: GraphicsInterface
    private actionCode: string

    public get invocationMessage() {
        return this.childAction.invocationMessage
    }

    public get commandAliases() {
        return this.childAction.commandAliases
    }

    private childAction: FeatureAction
    private parent: AbstractFeature

    public get optionsSchema() {
        return this.childAction.optionsSchema
    }

    public getChild() {
        return this.childAction
    }

    public constructor(options: {
        action: FeatureAction
        feature: AbstractFeature
        ui?: GraphicsInterface
        blockedCommands?: BlockedCommands
        optionOverrides?: OptionOverrides
        actionCode: string
    }) {
        const {
            action,
            feature,
            ui,
            blockedCommands,
            optionOverrides,
            actionCode,
        } = options

        if (!action || !action.execute) {
            throw new SpruceError({
                code: 'GENERIC',
                friendlyMessage: `${feature.nameReadable} failed to load action.`,
            })
        }

        this.childAction = action
        this.parent = feature
        this.blockedCommands = blockedCommands
        this.optionOverrides = optionOverrides
        this.ui = ui
        this.actionCode = actionCode

        methodDelegator.delegateFunctionCalls(this, action)
    }

    private assertCommandIsNotBlocked() {
        const commands = this.getCommands()

        for (const commandStr of commands) {
            if (this.blockedCommands?.[commandStr]) {
                throw new SpruceError({
                    code: 'COMMAND_BLOCKED',
                    command: commandStr,
                    hint: this.blockedCommands[commandStr],
                })
            }
        }
    }

    public execute = async (optionsArg: any) => {
        this.assertCommandIsNotBlocked()

        const options = this.mixinOptionOverrides(optionsArg)
        const response = await this.childAction.execute(options)

        return response
    }

    private getCommands() {
        return featuresUtil.generateCommandsIncludingAliases(
            this.parent.code,
            this.actionCode,
            this
        )
    }

    private mixinOptionOverrides(optionsArgs: any) {
        let { ...options } = optionsArgs

        const commands = this.getCommands()
        let namespace: string | undefined

        try {
            const pkg = this.parent.Service('pkg')
            namespace = pkg.getSkillNamespace()
        } catch {
            namespace = 'new skill'
        }

        for (const commandStr of commands) {
            const overrides = this.optionOverrides?.[commandStr]
            if (overrides) {
                this.ui?.renderLine(
                    `Overrides found in package.json of ${namespace}.`
                )
                this.ui?.renderObject(overrides)
                options = {
                    ...options,
                    ...overrides,
                }
            }
        }

        return options
    }
}
