import { buildSchema } from '@sprucelabs/schema'
import SpruceError from '../../../errors/SpruceError'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'

const optionsSchema = buildSchema({
    id: 'logoutAction',
    description: 'Logout as a person.',
    fields: {},
})
type OptionsSchema = typeof optionsSchema

export default class LogoutAction extends AbstractAction<OptionsSchema> {
    public optionsSchema: OptionsSchema = optionsSchema
    public commandAliases = ['logout']
    public invocationMessage = 'Logging out... 🤝'

    public async execute(): Promise<FeatureActionResponse> {
        const auth = this.Service('auth')
        const person = auth.getLoggedInPerson()

        if (!person) {
            return {
                errors: [
                    new SpruceError({
                        code: 'NOT_LOGGED_IN',
                    }),
                ],
            }
        }

        auth.logOutPerson()

        return {
            summaryLines: ['You have been logged out!'],
        }
    }
}
