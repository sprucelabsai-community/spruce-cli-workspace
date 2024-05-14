import { Schema, SchemaValues, SchemaPartialValues } from '@sprucelabs/schema'
import merge from 'lodash/merge'
import FormComponent from '../components/FormComponent'
import { CLI_HERO } from '../constants'
import SpruceError from '../errors/SpruceError'
import { GraphicsInterface } from '../types/cli.types'
import formUtil from '../utilities/form.utility'
import AbstractFeature, { FeatureDependency } from './AbstractFeature'
import featuresUtil from './feature.utilities'
import FeatureInstaller from './FeatureInstaller'
import {
    FeatureCode,
    FeatureInstallResponse,
    FeatureAction,
    FeatureMap,
} from './features.types'

export default class ActionQuestionAskerImpl<
    F extends FeatureCode = FeatureCode,
> implements ActionQuestionAsker<F>
{
    private ui: GraphicsInterface
    public static Class?: new (
        options: ActionQuestionAskerOptions
    ) => ActionQuestionAsker<any>
    private featureInstaller: FeatureInstaller
    private actionCode: string
    private feature: AbstractFeature
    private shouldAutoHandleDependencies = true

    protected constructor(options: ActionQuestionAskerOptions) {
        this.ui = options.ui
        this.featureInstaller = options.featureInstaller
        this.actionCode = options.actionCode
        this.feature = options.feature
        this.shouldAutoHandleDependencies = options.shouldAutoHandleDependencies
    }

    public static Asker(options: ActionQuestionAskerOptions) {
        return new (this.Class ?? ActionQuestionAskerImpl)(options)
    }

    public async installOrMarkAsSkippedMissingDependencies(): Promise<FeatureInstallResponse> {
        const notInstalled = await this.getDependenciesNotInstalled()

        let response: FeatureInstallResponse = {}
        let installCount = 0

        if (notInstalled.length > 0) {
            this.ui.renderLine(
                this.generateConfirmInstallMessage(notInstalled) + '\n'
            )

            while (notInstalled.length > 0) {
                const toInstall = notInstalled.shift()
                if (!toInstall) {
                    // for typescript
                    throw new Error('Dependent feature error')
                }

                const wasInstalled = await this.featureInstaller.isInstalled(
                    toInstall.code
                )

                if (
                    !wasInstalled &&
                    !this.featureInstaller.isMarkedAsSkipped(toInstall.code)
                ) {
                    const installResults =
                        await this.installOrMarkAsSkippedMissingDependency(
                            toInstall
                        )
                    response = merge(response, installResults)
                    installCount++
                }
            }

            if (installCount > 0) {
                this.ui.clear()

                await this.ui.waitForEnter(
                    `Phew, now that we're done with that, lets get back to ${this.getCommandName()}!`
                )

                this.ui.clear()
            }
        }

        return response
    }

    private async getDependenciesNotInstalled(): Promise<
        FeatureDependencyWithFeature[]
    > {
        const dependencies = this.featureInstaller.getFeatureDependencies(
            this.feature.code
        )

        const installedStatuses = await Promise.all(
            dependencies.map(async (dependency) => {
                const feature = this.featureInstaller.getFeature(
                    dependency.code
                )

                const isInstalled = await this.featureInstaller.isInstalled(
                    dependency.code
                )

                const isMarkedAsSkipped =
                    this.featureInstaller.isMarkedAsSkipped(feature.code)

                if (isMarkedAsSkipped) {
                    return null
                }

                return !isInstalled ? { feature, ...dependency } : null
            })
        )

        const notInstalled = installedStatuses.filter(
            (feature) => !!feature
        ) as FeatureDependencyWithFeature[]

        return notInstalled
    }

    public async askAboutMissingFeatureOptionsIfFeatureIsNotInstalled(
        isInstalled: boolean,
        options?: Record<string, any> & FeatureCommandExecuteOptions<F>
    ): Promise<Record<string, any> & FeatureCommandExecuteOptions<F>> {
        let installOptions = { ...options }

        if (!isInstalled) {
            if (this.feature.optionsSchema) {
                const answers = await this.collectAnswers(
                    this.feature.optionsSchema,
                    options
                )

                installOptions = { ...installOptions, ...answers }
            }
        }
        return installOptions as Record<string, any> &
            FeatureCommandExecuteOptions<F>
    }

    public async askAboutMissingActionOptions<S extends Schema>(
        action: FeatureAction<S>,
        options?: Record<string, any> & FeatureCommandExecuteOptions<F>
    ): Promise<SchemaValues<S> | undefined> {
        let answers

        const schema = action.optionsSchema
        if (schema) {
            answers = await this.collectAnswers(schema, options)
        }
        return answers
    }

    public async installOurFeature(installOptions: Record<string, any>) {
        if (!this.shouldAutoHandleDependencies) {
            throw new SpruceError({
                code: 'FEATURE_NOT_INSTALLED',
                featureCode: this.feature.code,
                friendlyMessage: `You need to install the \`${this.feature.code}\` feature.`,
            })
        }

        let isFirstUpdate = true

        const installResults = await this.featureInstaller.install({
            installFeatureDependencies: false,
            features: [
                {
                    code: this.feature.code as any,
                    options: installOptions as any,
                },
            ],
            didUpdateHandler: (message) => {
                if (isFirstUpdate) {
                    this.renderHeading(this.feature.code)
                    isFirstUpdate = false
                }
                this.ui.startLoading(message)
            },
        })

        this.ui.stopLoading()

        return installResults
    }

    private renderHeading(code: string) {
        this.ui.clear()
        this.ui.renderHero(CLI_HERO)
        this.ui.renderHeadline(`Installing ${code} feature...`)
    }

    private async installOrMarkAsSkippedMissingDependency(
        toInstall: FeatureDependencyWithFeature
    ): Promise<FeatureInstallResponse> {
        const { feature, isRequired } = toInstall

        if (isRequired) {
            const confirm = await this.ui.confirm(
                `Install the ${feature.nameReadable} feature?`
            )

            if (!confirm) {
                throw new SpruceError({
                    code: 'COMMAND_ABORTED',
                    command: this.getCommandName(),
                })
            }
        } else {
            const response = await this.ui.prompt({
                type: 'select',
                defaultValue: 'yes',
                label: `Install the ${feature.nameReadable} feature? (optional)`,
                options: {
                    choices: [
                        {
                            value: 'yes',
                            label: 'Yes',
                        },
                        {
                            value: 'skip',
                            label: 'Skip',
                        },
                        {
                            value: 'alwaysSkip',
                            label: 'Always skip',
                        },
                    ],
                },
            })

            if (response !== 'yes') {
                this.ui.renderLine(
                    response === 'alwaysSkip'
                        ? 'Skipping forever!'
                        : 'Cool, skipping for now.'
                )

                if (response === 'skip') {
                    this.featureInstaller.markAsSkippedThisRun(feature.code)
                } else {
                    this.featureInstaller.markAsPermanentlySkipped(feature.code)
                }

                const installResponse: FeatureInstallResponse = {}
                return installResponse
            }
        }

        let installOptions = {}

        if (feature.optionsSchema) {
            installOptions = await this.collectAnswers(
                feature.optionsSchema,
                undefined
            )
        }

        if (!this.shouldAutoHandleDependencies) {
            throw new SpruceError({
                code: 'FEATURE_NOT_INSTALLED',
                featureCode: this.feature.code,
                friendlyMessage: `You need to install the \`${this.feature.code}\` feature.`,
            })
        }

        let isFirstUpdate = true

        const installResults = await this.featureInstaller.install({
            installFeatureDependencies: false,
            didUpdateHandler: (message: string) => {
                if (isFirstUpdate) {
                    this.renderHeading(this.feature.code)
                    isFirstUpdate = false
                }
                this.ui.startLoading(message)
            },
            features: [
                {
                    code: feature.code as any,
                    options: installOptions as any,
                },
            ],
        })

        this.ui.stopLoading()

        return installResults
    }

    private async collectAnswers<S extends Schema>(
        schema: S,
        options: FeatureCommandExecuteOptions<F, S> | undefined
    ) {
        const cleaned: Record<string, any> = {}
        Object.keys(options ?? {}).forEach((key) => {
            //@ts-ignore
            if (typeof options[key] !== 'undefined') {
                //@ts-ignore
                cleaned[key] = options[key]
            }
        })

        const fieldNames = Object.keys(schema.fields ?? {})
        const providedFieldNames = cleaned ? Object.keys(cleaned ?? {}) : []
        const fieldsToPresent = fieldNames.filter(
            (name) =>
                providedFieldNames.indexOf(name) === -1 &&
                schema.fields?.[name].isRequired === true &&
                schema.fields?.[name].isPrivate !== true
        )

        let answers = {}
        if (fieldsToPresent.length > 0) {
            const featureForm = new FormComponent<S>({
                ui: this.ui,
                schema,
                //@ts-ignore
                initialValues: cleaned,
                onWillAskQuestion: formUtil.onWillAskQuestionHandler.bind(
                    formUtil
                ) as any,
            })

            answers = await featureForm.present({
                showOverview: false,
                // @ts-ignore
                fields: fieldsToPresent,
            })
        }

        return { ...(cleaned ?? {}), ...answers } as SchemaValues<S>
    }

    private getCommandName() {
        return featuresUtil.generateCommand(this.feature.code, this.actionCode)
    }

    private generateConfirmInstallMessage(
        notInstalled: FeatureDependencyWithFeature[]
    ): string {
        const required: FeatureDependencyWithFeature[] = []
        const optional: FeatureDependencyWithFeature[] = []

        notInstalled.forEach((feat) => {
            if (feat.isRequired) {
                required.push(feat)
            } else {
                optional.push(feat)
            }
        })

        const requiredMessage = `I'll need to install ${required.length} feature${s(
            required
        )}.`

        const optionalMessage = `there ${areIs(optional)} ${
            optional.length
        } optional feature${s(optional)} that could be installed.`

        const mixedMessage = `I found ${required.length} required and ${
            optional.length
        } optional feature${s(optional)} to install.`

        let message = mixedMessage

        if (optional.length === 0) {
            message = requiredMessage
        } else if (optional.length > 0 && required.length === 0) {
            message = optionalMessage
        }

        return `Before you can run \`${this.getCommandName()}\`, ${message} Don't worry, I'll walk you through it!`
    }
}

type FeatureCommandExecuteOptions<
    F extends FeatureCode,
    S extends Schema | undefined = FeatureMap[F]['optionsSchema'],
> = S extends Schema ? SchemaPartialValues<S> : undefined

type FeatureDependencyWithFeature = FeatureDependency & {
    feature: AbstractFeature
}

function s(array: any[]) {
    return array.length === 1 ? '' : ''
}

function areIs(array: any[]) {
    return array.length === 1 ? 'is' : 'are'
}

interface ActionQuestionAskerOptions {
    ui: GraphicsInterface
    featureInstaller: FeatureInstaller
    actionCode: string
    feature: AbstractFeature
    shouldAutoHandleDependencies: boolean
}

export type QuestionAskerOptionsOptions<F extends FeatureCode> = Record<
    string,
    any
> &
    FeatureCommandExecuteOptions<F>

export interface ActionQuestionAsker<F extends FeatureCode = FeatureCode> {
    installOrMarkAsSkippedMissingDependencies(): Promise<FeatureInstallResponse>
    askAboutMissingFeatureOptionsIfFeatureIsNotInstalled(
        isInstalled: boolean,
        options?: QuestionAskerOptionsOptions<F>
    ): Promise<Record<string, any> & FeatureCommandExecuteOptions<F>>
    askAboutMissingActionOptions<S extends Schema>(
        action: FeatureAction<S>,
        options?: QuestionAskerOptionsOptions<F>
    ): Promise<SchemaValues<S> | undefined>
    installOurFeature(
        installOptions: Record<string, any>
    ): Promise<FeatureInstallResponse>
}
