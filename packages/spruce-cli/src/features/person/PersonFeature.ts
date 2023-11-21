import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import AbstractFeature, { FeatureDependency } from '../AbstractFeature'
import { FeatureCode } from '../features.types'

export default class PersonFeature extends AbstractFeature {
	public code: FeatureCode = 'person'
	public nameReadable = 'Person'
	public description = 'Log in, log out, etc.'
	public dependencies: FeatureDependency[] = []
	public packageDependencies = []

	public actionsDir = diskUtil.resolvePath(__dirname, 'actions')

	public isInstalled = () => {
		return this.features.isInstalled('skill')
	}
}

declare module '../../features/features.types' {
	interface FeatureMap {
		person: PersonFeature
	}
}
