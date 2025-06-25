import { SchemaValues } from '@sprucelabs/schema'
import { SpruceSchemas } from '#spruce/schemas/schemas.types'
import upgradeSkillActionSchema from '#spruce/schemas/spruceCli/v2020_07_22/upgradeSkillOptions.schema'
import InFlightEntertainment from '../../../InFlightEntertainment'
import EsLint9Migrator from '../../../migration/EsLint9Migrator'
import ScriptUpdaterImpl from '../../../updaters/ScriptUpdater'
import actionUtil from '../../../utilities/action.utility'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'

export default class UpgradeAction extends AbstractAction<OptionsSchema> {
    public invocationMessage = 'Upgrading your skill... 💪'
    public optionsSchema = upgradeSkillActionSchema
    public commandAliases = ['upgrade', 'update']

    public async execute(options: Options): Promise<FeatureActionResponse> {
        const { upgradeMode } = this.validateAndNormalizeOptions(options)

        await EsLint9Migrator.Migrator({
            cwd: this.cwd,
        }).migrate()

        const isInSpruceModule = this.features.isInSpruceModule()

        if (isInSpruceModule) {
            await this.updateScripts({
                shouldConfirm: upgradeMode !== 'forceEverything',
            })
        }

        try {
            const files = isInSpruceModule
                ? await this.Writer('node', {
                      upgradeMode,
                  }).writeNodeModule(this.cwd, {
                      shouldConfirmBeforeWriting: true,
                      shouldWriteIndex: false,
                  })
                : []

            this.ui.clear()

            InFlightEntertainment.start([
                "Let's start the upgrade!",
                'While things are going, see if you can beat 1k points!',
                'Go!!!!',
            ])

            const dependencyResults = await this.reInstallPackageDependencies()

            return actionUtil.mergeActionResults(dependencyResults, {
                headline: 'Upgrade',
                files,
            })
        } finally {
            InFlightEntertainment.stop()
            this.ui.renderHero('Upgrade')
        }
    }

    private async reInstallPackageDependencies() {
        return this.Action('node', 'updateDependencies').execute({})
    }

    private async updateScripts(options: { shouldConfirm: boolean }) {
        const features = await this.features.getInstalledFeatures()

        let scripts: Record<string, any> = {}

        const pkg = this.Service('pkg')
        if (!features.find((f) => f.code === 'skill')) {
            const build = pkg.get('scripts.build')
            if (
                build ===
                'yarn run build.tsc --sourceMap ; yarn run resolve-paths'
            ) {
                pkg.unset(['scripts', 'build'])
            }
        }

        for (const feature of features) {
            scripts = {
                ...scripts,
                ...feature.scripts,
            }
        }

        const scriptUpdater = ScriptUpdaterImpl.FromFeature(this.parent, {
            latestScripts: scripts,
        })

        await scriptUpdater.update({
            shouldConfirmIfScriptExistsButIsDifferent: options.shouldConfirm,
        })
    }
}

type OptionsSchema =
    SpruceSchemas.SpruceCli.v2020_07_22.UpgradeSkillOptionsSchema
type Options = SchemaValues<OptionsSchema>
