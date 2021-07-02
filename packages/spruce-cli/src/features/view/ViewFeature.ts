import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { NpmPackage } from '../../types/cli.types'
import AbstractFeature, { FeatureDependency } from '../AbstractFeature'
import { ActionOptions, FeatureCode } from '../features.types'

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
	public actionsDir = diskUtil.resolvePath(__dirname, 'actions')

	public readonly packageDependencies: NpmPackage[] = [
		{
			name: '@sprucelabs/heartwood-view-controllers',
		},
		{
			name: '@sprucelabs/spruce-view-plugin',
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

	public constructor(options: ActionOptions) {
		super(options)

		void this.emitter.on('feature.did-execute', async (payload) => {
			const { featureCode, actionCode } = payload
			const isInstalled = await this.featureInstaller.isInstalled('view')

			if (isInstalled && featureCode === 'skill' && actionCode === 'upgrade') {
				const files = await this.Writer('view').writePlugin(this.cwd)
				return {
					files,
				}
			}
			return {}
		})

		void this.emitter.on('test.register-abstract-test-classes', async () => {
			return {
				abstractClasses: [
					{
						name: 'AbstractViewControllerTest',
						import: '@sprucelabs/spruce-view-plugin',
						featureCode: 'view',
					},
				],
			}
		})
	}

	public async afterPackageInstall() {
		const files = await this.Writer('view').writePlugin(this.cwd)

		return { files }
	}
}
