import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import AbstractFeature, {
	FeatureDependency,
	FeatureOptions,
} from '../AbstractFeature'
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

	public constructor(options: FeatureOptions) {
		super(options)

		void this.emitter.on(
			'feature.did-execute',
			this.handleDidExecuteAction.bind(this)
		)
	}

	public async handleDidExecuteAction({
		featureCode,
		actionCode,
	}: {
		featureCode: string
		actionCode: string
	}) {
		const isInstalled = await this.features.isInstalled('permission')

		if (isInstalled && featureCode === 'skill' && actionCode === 'upgrade') {
			await this.Action('permission', 'sync').execute({})
		}
	}
}

declare module '../../features/features.types' {
	interface FeatureMap {
		permission: PermissionFeature
	}
}
