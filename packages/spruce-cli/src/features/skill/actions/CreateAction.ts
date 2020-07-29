import { buildSchema } from '@sprucelabs/schema'
import AbstractFeatureAction from '../../../featureActions/AbstractFeatureAction'
import { IFeatureActionExecuteResponse } from '../../features.types'

export const skillCreateActionOptionsDefinition = buildSchema({
	id: 'createSkill',
	name: 'create skill',
	fields: {},
})

export type IDashboardActionDefinition = typeof skillCreateActionOptionsDefinition

export default class CreateAction extends AbstractFeatureAction {
	public name = 'create'
	public optionsSchema = skillCreateActionOptionsDefinition

	public execute(): Promise<IFeatureActionExecuteResponse> {
		return Promise.resolve({})
	}
}
