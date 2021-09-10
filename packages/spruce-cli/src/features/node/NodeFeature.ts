import { buildSchema, Schema, SchemaValues } from '@sprucelabs/schema'
import { diskUtil, namesUtil } from '@sprucelabs/spruce-skill-utils'
import { FileDescription, GeneratedFile } from '../../types/cli.types'
import ScriptUpdater from '../../updaters/ScriptUpdater'
import AbstractFeature, { FeatureDependency } from '../AbstractFeature'
import { FeatureCode } from '../features.types'
import universalDevDependencies from '../universalDevDependencies'
import universalFileDescriptions from '../universalFileDescriptions'
import universalScripts from '../universalScripts'

export const nodeFeatureSchema = buildSchema({
	id: 'nodeFeature',
	name: 'Node feature options',
	fields: {
		destination: {
			type: 'text',
			defaultValue: '.',
		},
		name: {
			type: 'text',
			isRequired: true,
			label: "What's the name of your module?",
		},
		description: {
			type: 'text',
			isRequired: true,
			label: 'How would you describe your module?',
		},
	},
})

type OptionsSchema = typeof nodeFeatureSchema
type Options = SchemaValues<OptionsSchema>

declare module '../../features/features.types' {
	interface FeatureMap {
		node: NodeFeature
	}

	interface FeatureOptionsMap {
		node: SchemaValues<OptionsSchema>
	}
}

export default class NodeFeature<
	S extends OptionsSchema = OptionsSchema
> extends AbstractFeature<S> {
	public code: FeatureCode = 'node'
	public nameReadable = 'nodejs support'
	public description = ''
	public dependencies: FeatureDependency[] = []
	public optionsSchema = nodeFeatureSchema as S
	public packageDependencies = [...universalDevDependencies]

	public scripts = {
		...universalScripts,
	}

	public readonly fileDescriptions: FileDescription[] = [
		...universalFileDescriptions,
	]

	public actionsDir = diskUtil.resolvePath(__dirname, 'actions')

	public async beforePackageInstall(options: Options) {
		const destination = this.resolveDestination(options)

		if (!diskUtil.doesDirExist(destination)) {
			diskUtil.createDir(destination)
		}

		const files: GeneratedFile[] = [
			{
				name: 'package.json',
				path: diskUtil.resolvePath(destination, 'package.json'),
				action: 'generated',
			},
		]

		await this.Service('command', destination).execute('yarn init -y')

		const nodeWriter = this.Writer('node')
		const written = await nodeWriter.writeNodeModule(destination)

		files.push(...written)

		await this.installScripts(destination)

		return { files, cwd: destination }
	}

	private resolveDestination(options: Options) {
		return diskUtil.resolvePath(this.cwd, options.destination ?? '')
	}

	public async afterPackageInstall(
		options: S extends Schema ? SchemaValues<S> : undefined
	) {
		const cwd = this.resolveDestination(options)
		const pkg = this.Service('pkg', cwd)

		pkg.set({ path: 'name', value: namesUtil.toKebab(options.name) })
		pkg.set({ path: 'description', value: options.description })
		pkg.set({ path: 'version', value: '0.0.1' })

		pkg.unset('main')
		pkg.unset('license')

		await this.Store('skill', { cwd }).setCurrentSkillsNamespace(options.name)

		return {}
	}

	private async installScripts(destination = this.cwd) {
		const scriptUpdater = ScriptUpdater.FromFeature(this, {
			cwd: destination,
		})

		await scriptUpdater.update()
	}

	public isInstalled = async (): Promise<boolean> => {
		return diskUtil.doesFileExist(
			diskUtil.resolvePath(this.cwd, 'package.json')
		)
	}
}
