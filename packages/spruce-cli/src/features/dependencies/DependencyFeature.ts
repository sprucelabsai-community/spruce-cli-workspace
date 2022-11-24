import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import AbstractFeature, { FeatureDependency } from '../AbstractFeature'
import { FeatureCode } from '../features.types'

declare module '../../features/features.types' {
	interface FeatureMap {
		dependency: DependencyFeature
	}
}

export default class DependencyFeature extends AbstractFeature {
	public description = 'Tell me which skills you depend on.'
	public code: FeatureCode = 'dependency'
	public nameReadable = 'Dependencies'
	public actionsDir = diskUtil.resolvePath(__dirname, 'actions')
	public dependencies: FeatureDependency[] = [
		{
			code: 'skill',
			isRequired: true,
		},
	]
	public packageDependencies = []

	public async isInstalled() {
		return this.features.isInstalled('skill')
	}
}
