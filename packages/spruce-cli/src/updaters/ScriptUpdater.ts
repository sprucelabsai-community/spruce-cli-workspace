import { SettingsService } from '@sprucelabs/spruce-skill-utils'
import {
    FILE_ACTION_ALWAYS_SKIP,
    FILE_ACTION_OVERWRITE,
    FILE_ACTION_SKIP,
} from '../constants'
import AbstractFeature from '../features/AbstractFeature'
import PkgService from '../services/PkgService'
import { GraphicsInterface } from '../types/cli.types'

export default class ScriptUpdaterImpl implements ScriptUpdater {
    private pkg: PkgService
    private latestScripts: Record<string, any>
    private shouldConfirmIfScriptExistsButIsDifferent: boolean
    private ui: GraphicsInterface
    private settings: SettingsService<string>
    public static Class?: new (
        options: ScriptUpdaterContructorOptions
    ) => ScriptUpdater

    public constructor(options: ScriptUpdaterContructorOptions) {
        this.pkg = options.pkg
        this.latestScripts = options.latestScripts
        this.shouldConfirmIfScriptExistsButIsDifferent =
            options.shouldConfirmIfScriptExistsButIsDifferent ?? true
        this.ui = options.ui
        this.settings = options.settings
    }

    public static FromFeature(
        feature: AbstractFeature,
        options?: { cwd?: string; latestScripts?: Record<string, any> }
    ) {
        const cwd = options?.cwd ?? feature.cwd

        const updater = new (this.Class ?? ScriptUpdaterImpl)({
            pkg: feature.Service('pkg', cwd),
            latestScripts: feature.scripts ?? [],
            //@ts-ignore
            ui: feature.ui,
            settings: feature.Service('settings', cwd),
            ...options,
        })

        return updater
    }

    public async update(options?: {
        shouldConfirmIfScriptExistsButIsDifferent?: boolean
    }) {
        this.shouldConfirmIfScriptExistsButIsDifferent =
            options?.shouldConfirmIfScriptExistsButIsDifferent ??
            this.shouldConfirmIfScriptExistsButIsDifferent

        const scripts =
            (this.pkg.get('scripts') as Record<string, string>) ?? {}
        const all = this.latestScripts
        const oldScripts = this.pkg.get('scripts') ?? {}

        let shouldConfirm = this.shouldConfirmIfScriptExistsButIsDifferent
        let shouldSkipAll = false
        const updaterSettings = {
            skipped: [],
            ...this.settings.get('scriptUpdater'),
        }

        for (const name in this.latestScripts) {
            const script = this.latestScripts[name as keyof typeof all]
            const oldScript = oldScripts[name as any]

            const shouldAlwaysSkip =
                (updaterSettings.skipped ?? []).indexOf(name) > -1
            let shouldWrite = !shouldSkipAll && !shouldAlwaysSkip

            if (
                shouldConfirm &&
                !shouldSkipAll &&
                oldScript &&
                script !== oldScript &&
                !shouldAlwaysSkip
            ) {
                this.ui.clear()
                this.ui.renderSection({
                    headline: `Change to \`${name}\` detected in ${this.pkg.getSkillNamespace()}!`,
                    object: {
                        Current: oldScript,
                        '    New': script,
                    },
                })

                const desiredAction = await this.ui.prompt({
                    type: 'select',
                    label: 'What should I do?',
                    options: {
                        choices: [
                            {
                                label: 'Overwrite',
                                value: FILE_ACTION_OVERWRITE,
                            },
                            {
                                label: 'Skip',
                                value: FILE_ACTION_SKIP,
                            },
                            {
                                label: 'Always skip',
                                value: FILE_ACTION_ALWAYS_SKIP,
                            },
                            {
                                label: 'Skip all',
                                value: 'skipAll',
                            },
                        ],
                    },
                })

                if (desiredAction === 'alwaysSkip') {
                    updaterSettings.skipped.push(name)
                    shouldWrite = false
                } else if (desiredAction === 'skipAll') {
                    shouldSkipAll = true
                    shouldWrite = false
                } else if (desiredAction === 'skip') {
                    shouldWrite = false
                }
            }

            if (shouldWrite) {
                scripts[name] = script
            }
        }

        this.settings.set('scriptUpdater', updaterSettings)
        this.pkg.set({ path: 'scripts', value: scripts })
    }
}

export interface ScriptUpdater {
    update(options?: {
        shouldConfirmIfScriptExistsButIsDifferent?: boolean
    }): Promise<void>
}

interface ScriptUpdaterContructorOptions {
    pkg: PkgService
    latestScripts: Record<string, any>
    shouldConfirmIfScriptExistsButIsDifferent?: boolean
    ui: GraphicsInterface
    settings: SettingsService
}
