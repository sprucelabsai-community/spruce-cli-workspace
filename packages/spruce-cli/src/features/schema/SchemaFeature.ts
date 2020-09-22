import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { NpmPackage } from '../../types/cli.types'
import AbstractFeature, { InstallResults } from '../AbstractFeature'
import { FeatureCode } from '../features.types'

export default class SchemaFeature extends AbstractFeature {
	public nameReadable = 'Schema'
	public description = 'Define, validate, and normalize everything.'
	public dependencies: FeatureCode[] = ['skill']
	public packageDependencies: NpmPackage[] = [
		{
			name: '@sprucelabs/schema',
		},
		{ name: '@sprucelabs/babel-plugin-schema', isDev: true },
	]

	public code: FeatureCode = 'schema'
	protected actionsDir = diskUtil.resolvePath(__dirname, 'actions')

	public async isInstalled() {
		try {
			return (
				this.Service('pkg').isInstalled('@sprucelabs/schema') &&
				diskUtil.doesFileExist(this.getPluginDestination())
			)
		} catch {
			return false
		}
	}

	public async afterPackageInstall(): Promise<InstallResults> {
		const plugin = this.templates.schemaPlugin()
		const destination = this.getPluginDestination()

		diskUtil.writeFile(destination, plugin)

		return {
			files: [
				{
					name: 'schema.plugin.ts',
					path: destination,
					action: 'generated',
					description: 'Enables schema support in your skill!',
				},
			],
		}
	}

	private getPluginDestination() {
		return diskUtil.resolveHashSprucePath(
			this.cwd,
			'features',
			'schema.plugin.ts'
		)
	}
}
