import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import createTestOptionsSchema from '#spruce/schemas/spruceCli/v2020_07_22/createTestOptions.schema'
import AbstractFeature, {
    FeatureDependency,
    FeatureOptions,
} from '../AbstractFeature'
import featuresUtil from '../feature.utilities'
import { FeatureCode } from '../features.types'
import ScriptLoader from './ScriptLoader'
import OnboardingStore from './stores/OnboardingStore'

export default class OnboardFeature extends AbstractFeature {
    public code: FeatureCode = 'onboard'
    public nameReadable = 'Onboard'
    public description = 'Get building your first skill already!'
    public dependencies: FeatureDependency[] = []
    public packageDependencies = []

    public actionsDir = diskUtil.resolvePath(__dirname, 'actions')

    private onboardingStore?: OnboardingStore
    private scriptsDir = diskUtil.resolvePath(__dirname, 'scripts')

    public constructor(options: FeatureOptions) {
        super(options)

        void this.emitter.on(
            'feature.will-execute',
            this.handleWillExecuteCommand.bind(this)
        )

        void this.emitter.on(
            'test.reporter-did-boot',
            this.handleTestReporterDidBoot.bind(this)
        )
    }

    public OnboardingStore() {
        if (!this.onboardingStore) {
            this.onboardingStore = this.Store('onboarding')
        }
        return this.onboardingStore
    }

    public async ScriptPlayer() {
        const store = this.OnboardingStore()

        const player = await ScriptLoader.LoadScripts({
            ui: this.ui,
            dir: this.scriptsDir,
            onboardingStore: store,
            commandExecuter: async (_command: string) => {
                throw new Error(
                    "I can't run commands for you yet, but will be able to soon. For now run `spruce " +
                        _command +
                        '` manually.'
                )
            },
        })

        return player
    }

    private async handleWillExecuteCommand(payload: {
        featureCode: string
        actionCode: string
    }) {
        const onboarding = this.Store('onboarding')

        if (onboarding.getMode() !== 'off') {
            const command = this.generateCommandFromPayload(payload)
            await this.confirmExpectedCommand(payload, onboarding)

            if (
                onboarding.getMode() !== 'off' &&
                this.isExpectedCommand(command, onboarding)
            ) {
                const player = await this.ScriptPlayer()
                await player.playScriptWithKey(`todo.${command}`)
            }
        }
    }

    private handleTestReporterDidBoot() {
        const onboarding = this.Store('onboarding')

        if (onboarding.getMode() !== 'off') {
            const source = diskUtil.resolvePath(
                __dirname,
                'templates',
                'RootViewController.test.ts.hbs'
            )

            const contents = diskUtil.readFile(source)

            const destination = diskUtil.resolvePath(
                this.cwd,
                createTestOptionsSchema.fields.testDestinationDir.defaultValue,
                'behavioral',
                'RootViewController.test.ts'
            )

            diskUtil.writeFile(destination, contents)

            this.Store('onboarding').reset()
        }
    }

    private generateCommandFromPayload(payload: {
        featureCode: string
        actionCode: string
    }) {
        return featuresUtil.generateCommand(
            payload.featureCode,
            payload.actionCode
        )
    }

    public isInstalled = async (): Promise<boolean> => {
        return true
    }

    private async confirmExpectedCommand(
        payload: { featureCode: string; actionCode: string },
        store: OnboardingStore
    ) {
        const command = this.generateCommandFromPayload(payload)
        const isExpectedCommand = this.isExpectedCommand(command, store)

        if (
            command !== 'setup.vscode' &&
            payload.featureCode !== 'onboard' &&
            !isExpectedCommand
        ) {
            const player = await this.ScriptPlayer()
            await player.playScriptWithKey('wrongCommand')
        }
    }

    private isExpectedCommand(command: string, store: OnboardingStore) {
        const stage = store.getStage()

        const isExpectedCommand = command === stage
        return isExpectedCommand
    }
}

declare module '../../features/features.types' {
    interface FeatureMap {
        onboard: OnboardFeature
    }

    interface FeatureOptionsMap {
        onboard: undefined
    }
}
