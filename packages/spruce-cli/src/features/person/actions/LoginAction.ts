import { buildSchema, SchemaValues } from '@sprucelabs/schema'
import { eventResponseUtil } from '@sprucelabs/spruce-event-utils'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'

export default class LoginAction extends AbstractAction<OptionsSchema> {
    public optionsSchema: OptionsSchema = optionsSchema
    public commandAliases = ['login']
    public invocationMessage = 'Logging in... 🤝'

    public async execute(options: Options): Promise<FeatureActionResponse> {
        const { phone, pin: suppliedPin } =
            this.validateAndNormalizeOptions(options)
        let loggedIn = false

        const client = await this.connectToApi({
            shouldAuthAsLoggedInPerson: false,
        })

        const requestPinResults = await client.emit(
            'request-pin::v2020_12_25',
            {
                payload: { phone },
            }
        )

        const { challenge } =
            eventResponseUtil.getFirstResponseOrThrow(requestPinResults)

        const response: FeatureActionResponse = {}

        do {
            const pin =
                suppliedPin ??
                (await this.ui.prompt({
                    type: 'text',
                    label: 'Pin',
                    isRequired: true,
                }))

            const confirmPinResults = await client.emit(
                'confirm-pin::v2020_12_25',
                {
                    payload: { challenge, pin },
                }
            )

            try {
                const { person, token } =
                    eventResponseUtil.getFirstResponseOrThrow(confirmPinResults)

                const loggedInPerson = { ...person, token }

                this.Service('auth').setLoggedInPerson(loggedInPerson)

                loggedIn = true

                response.meta = { loggedInPerson }
                response.summaryLines = [
                    `Logged in as ${loggedInPerson.casualName}`,
                ]
            } catch (err) {
                this.ui.renderWarning('Oops, bad pin. Try again please! 🙏')
            }
        } while (!loggedIn)

        return response
    }
}

const optionsSchema = buildSchema({
    id: 'loginAction',
    description:
        'Authenticate as a person. From here, you can begin creating skill, organizations, conversation topics, etc.',
    fields: {
        phone: {
            type: 'phone',
            label: 'Phone number',
            isRequired: true,
        },
        pin: {
            type: 'text',
            label: 'Pin',
        },
    },
})
type OptionsSchema = typeof optionsSchema
type Options = SchemaValues<OptionsSchema>
