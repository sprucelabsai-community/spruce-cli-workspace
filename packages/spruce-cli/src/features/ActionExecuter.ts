import { Schema } from '@sprucelabs/schema'
import { eventResponseUtil } from '@sprucelabs/spruce-event-utils'
import merge from 'lodash/merge'
import SpruceError from '../errors/SpruceError'
import { GlobalEmitter } from '../GlobalEmitter'
import { GraphicsInterface } from '../types/cli.types'
import actionUtil from '../utilities/action.utility'
import ActionFactory from './ActionFactory'
import ActionQuestionAskerImpl from './ActionQuestionAsker'
import FeatureInstaller from './FeatureInstaller'
import {
    FeatureCode,
    FeatureInstallResponse,
    FeatureAction,
    FeatureActionResponse,
} from './features.types'

export default class ActionExecuter {
    private emitter: GlobalEmitter
    private ui: GraphicsInterface
    private actions: ActionFactory
    private featureInstallerFactory: () => FeatureInstaller
    private shouldAutoHandleDependencies: boolean
    private shouldThrowOnListenerError: boolean

    public constructor(options: ActionExecuterOptions) {
        this.featureInstallerFactory = options.featureInstallerFactory
        this.emitter = options.emitter
        this.ui = options.ui
        this.actions = options.actionFactory
        this.shouldAutoHandleDependencies =
            options.shouldAutoHandleDependencies ?? true

        this.shouldThrowOnListenerError = !!options.shouldThrowOnListenerError
    }

    private getFeatureInstaller() {
        return this.featureInstallerFactory()
    }

    private async execute(options: {
        featureCode: FeatureCode
        actionCode: string
        action: FeatureAction<Schema>
        originalExecute: FeatureAction<Schema>['execute']
        options?: Record<string, any>
    }): Promise<FeatureInstallResponse & FeatureActionResponse> {
        const {
            featureCode,
            actionCode,
            action,
            originalExecute,
            options: actionOptions,
        } = options

        const installer = this.getFeatureInstaller()
        const isInstalled = await installer.isInstalled(featureCode)

        if (!isInstalled && !this.shouldAutoHandleDependencies) {
            throw new SpruceError({
                code: 'FEATURE_NOT_INSTALLED',
                featureCode,
                friendlyMessage: `You need to install the \`${featureCode}\` feature.`,
            })
        }

        const willExecuteResults = await this.emitter.emit(
            'feature.will-execute',
            {
                featureCode,
                actionCode,
                options: actionOptions,
            }
        )

        const { payloads: willExecutePayloads, errors } =
            eventResponseUtil.getAllResponsePayloadsAndErrors(
                willExecuteResults,
                SpruceError
            )

        if (errors?.length ?? 0 > 0) {
            if (this.shouldThrowOnListenerError) {
                //@ts-ignore
                throw errors[0]
            }
            return { errors }
        }

        actionUtil.assertNoErrorsInResponse(willExecuteResults)

        const feature = installer.getFeature(featureCode)

        const asker = ActionQuestionAskerImpl.Asker({
            featureInstaller: installer,
            feature,
            actionCode,
            shouldAutoHandleDependencies: this.shouldAutoHandleDependencies,
            ui: this.ui,
        })

        let response =
            (await asker.installOrMarkAsSkippedMissingDependencies()) ?? {}

        const installOptions =
            (await asker.askAboutMissingFeatureOptionsIfFeatureIsNotInstalled(
                isInstalled,
                actionOptions
            )) ??
            actionOptions ??
            {}

        let answers =
            (await asker.askAboutMissingActionOptions(
                action,
                installOptions
            )) ?? installOptions

        if (!isInstalled) {
            const ourFeatureResults =
                (await asker.installOurFeature(installOptions)) ?? {}
            response = merge(response, ourFeatureResults)
        }

        let executeResults: FeatureActionResponse = {}

        try {
            executeResults = await originalExecute({
                ...answers,
            })
        } catch (err: any) {
            executeResults.errors = [err]
        }

        response = merge(response, executeResults)

        const didExecuteResults = await this.emitter.emit(
            'feature.did-execute',
            {
                results: response,
                featureCode,
                actionCode,
                options: actionOptions,
            }
        )

        const { payloads, errors: didExecuteErrors } =
            eventResponseUtil.getAllResponsePayloadsAndErrors(
                didExecuteResults,
                SpruceError
            )

        if (
            (this.shouldThrowOnListenerError && didExecuteErrors?.length) ??
            0 > 0
        ) {
            //@ts-ignore
            throw didExecuteErrors[0]
        }

        response = actionUtil.mergeActionResults(
            response,
            ...willExecutePayloads,
            ...payloads
        )

        if (didExecuteErrors) {
            response = actionUtil.mergeActionResults(response, {
                errors: didExecuteErrors,
            })
        }

        return response
    }

    public Action<F extends FeatureCode>(
        featureCode: F,
        actionCode: string
    ): FeatureAction {
        const featureInstaller = this.getFeatureInstaller()

        const action = this.actions.Action({
            featureCode,
            actionCode,
            actionExecuter: this,
            featureInstaller,
        })

        const originalExecute = action.execute.bind(action)

        action.execute = async (options: Record<string, any>) => {
            return this.execute({
                featureCode,
                actionCode,
                action,
                originalExecute,
                options,
            })
        }

        return action as FeatureAction<Schema>
    }
}

export interface ActionExecuterOptions {
    ui: GraphicsInterface
    emitter: GlobalEmitter
    actionFactory: ActionFactory
    featureInstallerFactory: () => FeatureInstaller
    shouldAutoHandleDependencies?: boolean
    shouldThrowOnListenerError?: boolean
}
