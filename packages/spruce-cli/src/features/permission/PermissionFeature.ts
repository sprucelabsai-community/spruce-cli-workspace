import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import AbstractFeature, { FeatureDependency } from '../AbstractFeature'
import { FeatureCode } from '../features.types'

export default class PermissionFeature extends AbstractFeature {
	public code: FeatureCode = 'permission'
	public nameReadable = 'permission'
	public description = 'Manage permissions for your skill'
	public dependencies: FeatureDependency[] = [
		{
			code: 'skill',
			isRequired: true,
		},
		{
			code: 'event',
			isRequired: true,
		},
	]
	public packageDependencies = []

	public actionsDir = diskUtil.resolvePath(__dirname, 'actions')
}

declare module '../../features/features.types' {
	interface FeatureMap {
		permission: PermissionFeature
	}
}
