import { Schema } from '@sprucelabs/schema'
import { namesUtil } from '@sprucelabs/spruce-skill-utils'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import SpruceError from '../errors/SpruceError'
import {
    FeatureAction,
    ActionOptions,
    FeatureCode,
} from '../features/features.types'
import { GlobalEmitter } from '../GlobalEmitter'
import { BlockedCommands, OptionOverrides } from '../types/cli.types'
import ActionExecuter from './ActionExecuter'
import FeatureInstaller from './FeatureInstaller'
import OverrideActionDecorator from './OverrideActionDecorator'

export default class ActionFactory {
    private actionOptions: FeatureActionFactoryOptions
    private blockedCommands?: BlockedCommands
    private optionOverrides?: OptionOverrides
    private static overrides: Record<string, ActionConstructor> = {}

    public constructor(options: FeatureActionFactoryOptions) {
        const { blockedCommands, optionOverrides, ...actionOptions } = options
        this.actionOptions = actionOptions
        this.blockedCommands = blockedCommands
        this.optionOverrides = optionOverrides
    }

    public Action<F extends FeatureCode, S extends Schema = Schema>(options: {
        featureCode: F
        actionCode: string
        actionExecuter: ActionExecuter
        featureInstaller: FeatureInstaller
    }): FeatureAction<S> {
        const { featureCode, actionCode, actionExecuter, featureInstaller } =
            options

        const feature = featureInstaller.getFeature(featureCode)

        if (!feature.actionsDir) {
            throw new Error(
                `Your ${featureCode} features needs \`public actionsDir = diskUtil.resolvePath(__dirname, 'actions')\``
            )
        }

        let Class: (new (options: ActionOptions) => FeatureAction) | undefined =
            undefined
        let originalError: Error | undefined

        const key = ActionFactory.overrideKey(featureCode, actionCode)
        if (ActionFactory.overrides[key]) {
            Class = ActionFactory.overrides[key]
        } else {
            const classPath = diskUtil.resolvePath(
                feature.actionsDir,
                `${namesUtil.toPascal(actionCode)}Action`
            )
            try {
                Class = require(classPath).default
            } catch (err: any) {
                originalError = err
            }
        }

        if (!Class) {
            throw new SpruceError({
                code: 'GENERIC',
                friendlyMessage: `I could not find any action named '${actionCode}' for the ${feature.code} feature. Make sure it's the default export and extends AbstractAction.`,
                originalError,
            })
        }

        const action = new Class({
            ...this.actionOptions,
            actionExecuter,
            parent: feature,
            featureInstaller,
        })

        if (!action) {
            throw new SpruceError({
                code: 'GENERIC',
                friendlyMessage: `I could not instantiate ${actionCode} action on ${feature.code} feature.`,
            })
        }

        if (!action.execute) {
            throw new SpruceError({
                code: 'GENERIC',
                friendlyMessage: `It looks like the ${feature.code} feature's '${actionCode}' action does not properly extend AbstractAction.`,
            })
        }

        const actionDecorator = new OverrideActionDecorator({
            action,
            feature,
            blockedCommands: this.blockedCommands,
            optionOverrides: this.optionOverrides,
            ui: this.actionOptions.ui,
            actionCode,
        })

        return actionDecorator as FeatureAction<S>
    }

    public static setActionClass(
        featureCode: FeatureCode,
        action: string,
        ExecuteTrackingAction: ActionConstructor
    ) {
        this.overrides[ActionFactory.overrideKey(featureCode, action)] =
            ExecuteTrackingAction
    }

    private static overrideKey(featureCode: string, action: string) {
        return `${featureCode}${action}`
    }

    public static clearActionOverrides() {
        this.overrides = {}
    }
}

export interface FeatureActionFactoryOptions
    extends Omit<
        ActionOptions,
        'parent' | 'actionExecuter' | 'featureInstaller'
    > {
    emitter: GlobalEmitter
    blockedCommands?: BlockedCommands
    optionOverrides?: OptionOverrides
}

type ActionConstructor = new (options: ActionOptions) => FeatureAction
