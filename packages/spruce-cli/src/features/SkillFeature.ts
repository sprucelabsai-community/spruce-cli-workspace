// import { SchemaDefinitionValues } from '@sprucelabs/schema'
import Schema from '@sprucelabs/schema'
import { DirectoryTemplateKind } from '@sprucelabs/spruce-templates'
import skillFeatureDefinition from '#spruce/schemas/local/skillFeature.definition'
import { SpruceSchemas } from '#spruce/schemas/schemas.types'
// import { WriteMode } from '../types/cli.types'
import { FeatureCode } from '../FeatureManager'
import { INpmPackage } from '../types/cli.types'
import diskUtil from '../utilities/disk.utility'
import AbstractFeature from './AbstractFeature'

type SkillFeatureDefinition = SpruceSchemas.Local.SkillFeature.IDefinition
type Skill = SpruceSchemas.Local.ISkillFeature

export default class SkillFeature extends AbstractFeature<
	SkillFeatureDefinition
> {
	public description =
		'Skill: The most basic configuration needed to enable a skill'

	public dependencies: FeatureCode[] = []
	public packageDependencies: INpmPackage[] = [
		{ name: 'typescript' },
		{ name: '@sprucelabs/log' },
		{ name: '@types/node', isDev: true },
		{ name: 'ts-node', isDev: true },
		{ name: 'tsconfig-paths', isDev: true }
	]

	public optionsDefinition = skillFeatureDefinition

	public async beforePackageInstall(options: Skill) {
		await this.install(options)
	}

	private async install(options: SpruceSchemas.Local.ISkillFeature) {
		const schema = new Schema(skillFeatureDefinition, options)
		schema.validate()

		const files = await this.templates.directoryTemplate({
			kind: DirectoryTemplateKind.Skill,
			context: options
		})

		await diskUtil.createManyFiles(this.cwd, files)
	}

	// public async afterPackageInstall() {
	// 	// 	this.services.pkg.set({
	// 	// 		path: 'scripts.build',
	// 	// 		value: 'npm run build:node'
	// 	// 	})
	// 	// 	this.services.pkg.set({
	// 	// 		path: 'scripts.build:node',
	// 	// 		value: 'npm run build:node'
	// 	// 	})
	// 	// this.services.pkg.set({
	// 	// 	path: 'scripts.clean',
	// 	// 	value: 'rm -rf build/ && rm -rf node_modules/'
	// 	// })
	// }

	public async isInstalled() {
		const pathToCheck = diskUtil.resolvePath(this.cwd, 'package.json')
		return diskUtil.doesFileExist(pathToCheck)
	}
}
