import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { NpmPackage } from '../../types/cli.types'
import AbstractFeature, { FeatureDependency } from '../AbstractFeature'
import { FeatureCode } from '../features.types'

declare module '../../features/features.types' {
	interface FeatureMap {
		view: ViewFeature
	}

	interface FeatureOptionsMap {
		view: undefined
	}
}

export default class ViewFeature extends AbstractFeature {
	public nameReadable = 'views'
	public description = 'Views: Create views using the Heartwood framework.'
	public code: FeatureCode = 'view'
	protected actionsDir = diskUtil.resolvePath(__dirname, 'actions')

	public readonly packageDependencies: NpmPackage[] = [
		{
			name: '@sprucelabs/heartwood-view-controllers',
		},
	]

	public dependencies: FeatureDependency[] = [
		{
			code: 'skill',
			isRequired: true,
		},
		{
			code: 'schema',
			isRequired: true,
		},
		{
			code: 'event',
			isRequired: true,
		},
	]
}
