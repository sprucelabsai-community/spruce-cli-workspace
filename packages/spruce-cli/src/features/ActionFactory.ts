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
import AbstractAction from './AbstractAction'
import ActionExecuter from './ActionExecuter'
import FeatureInstaller from './FeatureInstaller'
import OverrideActionDecorator from './OverrideActionDecorator'

export interface FeatureActionFactoryOptions
	extends Omit<
		ActionOptions,
		'parent' | 'actionExecuter' | 'featureInstaller'
	> {
	emitter: GlobalEmitter
	blockedCommands?: BlockedCommands
	optionOverrides?: OptionOverrides
}

export default class ActionFactory {
	private actionOptions: FeatureActionFactoryOptions
	private blockedCommands?: BlockedCommands
	private optionOverrides?: OptionOverrides

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

		const classPath = diskUtil.resolvePath(
			feature.actionsDir,
			`${namesUtil.toPascal(actionCode)}Action`
		)

		let Class: new (options: ActionOptions) => AbstractAction | undefined
		let originalError: Error | undefined

		try {
			Class = require(classPath).default
			// eslint-disable-next-line no-empty
		} catch (err: any) {
			originalError = err
		}

		//@ts-ignore
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
}
