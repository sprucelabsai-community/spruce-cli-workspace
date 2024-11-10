import { buildSchema, SchemaValues } from '@sprucelabs/schema'
import { SelectChoice } from '@sprucelabs/spruce-core-schemas'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse, FeatureCode } from '../../features.types'

export default class InstallFeatureAction extends AbstractAction<OptionsSchema> {
    public optionsSchema = optionsSchema
    public invocationMessage = 'Installing a feature... 🚀'
    public commandAliases = ['install.feature']

    public async execute(
        options: InstallFeatureActionOptions
    ): Promise<FeatureActionResponse> {
        let { code } = options ?? {}

        if (!code) {
            const choices: SelectChoice[] = await this.buildFeatureChoices()

            if (!choices.length) {
                return {
                    summaryLines: [
                        'Nothing to install, you have already installed everything!',
                    ],
                }
            }

            code = await this.promptForFeature(choices)
        }
        const results = await this.features.install({
            features: [{ code: code as any }],
        })

        return results
    }

    private async promptForFeature(choices: SelectChoice[]) {
        return await this.ui.prompt({
            type: 'select',
            label: 'Which feature do you want to install?',
            isRequired: true,
            options: {
                choices,
            },
        })
    }

    private async buildFeatureChoices() {
        const choices: SelectChoice[] = []

        for (const key in features) {
            const isInstalled = await this.features.isInstalled(
                key as FeatureCode
            )
            if (!isInstalled) {
                choices.push({
                    label: features[key as keyof typeof features],
                    value: key,
                })
            }
        }
        return choices
    }
}

const features = {
    error: 'Errors',
    event: 'Events',
    schema: 'Schemas',
    store: 'Stores (including database support)',
    test: 'Tests',
    view: 'Views',
}

const allFeatureChoices: SelectChoice[] = Object.keys(features).map((key) => ({
    label: features[key as keyof typeof features],
    value: key,
}))

const optionsSchema = buildSchema({
    id: 'installFeature',
    fields: {
        code: {
            type: 'select',
            label: 'Feature to install',
            options: {
                choices: allFeatureChoices,
            },
        },
    },
})

type OptionsSchema = typeof optionsSchema
export type InstallFeatureActionOptions = SchemaValues<OptionsSchema>
