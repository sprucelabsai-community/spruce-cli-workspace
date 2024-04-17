import { buildSchema } from '@sprucelabs/schema'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'

export const optionsSchema = buildSchema({
    id: 'dashboard',
    name: 'Skill dashboard',
    description: 'Coming soon...',
    fields: {},
})

export type DashboardActionDefinition = typeof optionsSchema

export default class DashboardAction extends AbstractAction<DashboardActionDefinition> {
    public optionsSchema = optionsSchema
    public commandAliases = ['dashboard']
    public invocationMessage = 'Loading dashboard... ⚡️'

    public async execute(): Promise<FeatureActionResponse> {
        return {
            hints: ['Coming soon.'],
        }
    }
}
