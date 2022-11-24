import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { FileDescription } from '../../types/cli.types'
import AbstractFeature, { FeatureDependency } from '../AbstractFeature'
import { FeatureCode } from '../features.types'

declare module '../../features/features.types' {
	interface FeatureMap {
		eventContract: EventContractFeature
	}
}

export default class EventContractFeature extends AbstractFeature {
	public code: FeatureCode = 'eventContract'
	public nameReadable = 'Event Contract'
	public description =
		'Pull core Mercury events down and write to single, portable, dependency-free, strongly typed contract.'
	public dependencies: FeatureDependency[] = [
		{
			code: 'permission',
			isRequired: true,
		},
	]
	public packageDependencies = []

	public actionsDir = diskUtil.resolvePath(__dirname, 'actions')
	public readonly fileDescriptions: FileDescription[] = []

	public isInstalled = async () => true
}
