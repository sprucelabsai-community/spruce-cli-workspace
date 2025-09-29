import { SpruceSchemas } from '#spruce/schemas/schemas.types'
import setupTestsOptionsSchema from '#spruce/schemas/spruceCli/v2020_07_22/setupTestsOptions.schema'
import actionUtil from '../../../utilities/action.utility'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'

type OptionsSchema = SpruceSchemas.SpruceCli.v2020_07_22.SetupTestsOptionsSchema
type Options = SpruceSchemas.SpruceCli.v2020_07_22.SetupTestsOptions

export default class SetupAction extends AbstractAction<OptionsSchema> {
    public optionsSchema = setupTestsOptionsSchema
    public commandAliases = ['setup.testing']
    public invocationMessage = 'Setting up for testing... 🛡'

    public async execute(options: Options): Promise<FeatureActionResponse> {
        const normalizedOptions = this.validateAndNormalizeOptions(options)
        const { demoNumber, skillSlug } = normalizedOptions

        const loginResponse = await this.Action('person', 'login').execute({
            phone: demoNumber,
            pin: demoNumber.substr(demoNumber.length - 4),
        })

        const registerResponse = await this.Action('skill', 'register').execute(
            {
                nameReadable: skillSlug,
                nameKebab: skillSlug,
            }
        )

        const err = registerResponse.errors?.[0]

        const isDuplicateSlugError = err?.options?.code === 'DUPLICATE_SLUG'

        let loginAsSkillResponse: any = {}

        if (isDuplicateSlugError) {
            delete registerResponse.errors

            loginAsSkillResponse = await this.Action('skill', 'login').execute({
                skillSlug,
            })
        }

        return actionUtil.mergeActionResults(
            {},
            loginResponse,
            registerResponse,
            loginAsSkillResponse
        )
    }
}
