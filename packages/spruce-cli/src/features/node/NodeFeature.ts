import { Schema, SchemaValues } from '@sprucelabs/schema'
import { SpruceSchemas } from '@sprucelabs/spruce-core-schemas'
import { diskUtil, namesUtil } from '@sprucelabs/spruce-skill-utils'
import nodeFeatureOptionsSchema from '#spruce/schemas/spruceCli/v2020_07_22/nodeFeatureOptions.schema'
import { FileDescription, GeneratedFile } from '../../types/cli.types'
import ScriptUpdater from '../../updaters/ScriptUpdater'
import AbstractFeature, { FeatureDependency } from '../AbstractFeature'
import { ActionOptions, FeatureCode } from '../features.types'
import universalDevDependencies from '../universalDevDependencies'
import universalFileDescriptions from '../universalFileDescriptions'
import universalScripts from '../universalScripts'

type OptionsSchema =
	SpruceSchemas.SpruceCli.v2020_07_22.NodeFeatureOptionsSchema
type Options = SpruceSchemas.SpruceCli.v2020_07_22.NodeFeatureOptions

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
	public optionsSchema = nodeFeatureOptionsSchema as S
	public packageDependencies = [...universalDevDependencies]

	public scripts = {
		...universalScripts,
	}

	public readonly fileDescriptions: FileDescription[] = [
		...universalFileDescriptions,
	]

	public actionsDir = diskUtil.resolvePath(__dirname, 'actions')

	public constructor(options: ActionOptions) {
		super(options)

		void this.emitter.on('feature.did-execute', async (payload) => {
			if (payload.featureCode === 'node' && payload.actionCode === 'upgrade') {
				try {
					this.ui.startLoading('Cleaning build...')
					await this.Service('command').execute('yarn clean.build')

					this.ui.startLoading('Applying lint rules to all files...')
					await this.Service('command').execute('yarn fix.lint')

					this.ui.startLoading('Rebuilding...')
					await this.Service('command').execute('yarn build.dev')

					return {
						summaryLines: [
							'Build cleared.',
							'Lint rules applied to source.',
							'Code rebuilt successfully.',
						],
					}
				} catch (err) {
					return {
						errors: [err],
					}
				}
			}

			return {}
		})
	}

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
