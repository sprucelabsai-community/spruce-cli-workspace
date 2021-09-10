import { SchemaValues, validateSchemaValues } from '@sprucelabs/schema'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { SpruceSchemas } from '#spruce/schemas/schemas.types'
import skillFeatureSchema from '#spruce/schemas/spruceCli/v2020_07_22/skillFeature.schema'
import { FileDescription, NpmPackage } from '../../types/cli.types'
import ScriptUpdater from '../../updaters/ScriptUpdater'
import AbstractFeature, { FeatureOptions } from '../AbstractFeature'
import { FeatureCode } from '../features.types'
import universalDevDependencies from '../universalDevDependencies'
import universalFileDescriptions from '../universalFileDescriptions'
import universalScripts from '../universalScripts'
import Updater from './updaters/Updater'

type SkillFeatureOptionsSchema =
	SpruceSchemas.SpruceCli.v2020_07_22.SkillFeatureSchema
type SkillFeatureOptions = SpruceSchemas.SpruceCli.v2020_07_22.SkillFeature

declare module '../../features/features.types' {
	interface FeatureMap {
		skill: SkillFeature
	}

	interface FeatureOptionsMap {
		skill: SchemaValues<SkillFeatureOptionsSchema>
	}
}

type UpgradeOptions = SpruceSchemas.SpruceCli.v2020_07_22.UpgradeSkillOptions

export default class SkillFeature<
	S extends SkillFeatureOptionsSchema = SkillFeatureOptionsSchema
> extends AbstractFeature<S> {
	public nameReadable = 'Skill'
	public code: FeatureCode = 'skill'
	public description = 'The scaffolding needed to run a Skill'
	public readonly installOrderWeight = 100

	public packageDependencies: NpmPackage[] = [
		{ name: '@sprucelabs/error' },
		{ name: '@sprucelabs/spruce-skill-utils' },
		{ name: '@sprucelabs/spruce-skill-booter' },
		{ name: '@sprucelabs/spruce-event-utils' },
		{ name: '@sprucelabs/spruce-event-plugin' },
		{ name: '@sprucelabs/spruce-core-schemas' },
		{ name: 'dotenv' },
		{ name: 'globby', version: '^11.0.4' },
		{
			name: '@sprucelabs/mercury-types',
		},
		...universalDevDependencies,
	]

	public optionsSchema = skillFeatureSchema as S
	public actionsDir = diskUtil.resolvePath(__dirname, 'actions')
	private engines = {
		node: '16.x',
		yarn: '1.x',
	}
	public scripts = {
		boot: 'node build/index',
		'boot.local':
			'node -r ts-node/register -r tsconfig-paths/register ./src/index',

		health: 'yarn boot --health',
		'health.local': 'yarn boot.local --health',

		...universalScripts,
	}

	public readonly fileDescriptions: FileDescription[] = [
		...universalFileDescriptions,
		{
			path: 'src/index.ts',
			description: 'The file that "boots" the skill.',
			shouldOverwriteWhenChanged: true,
		},
		{
			path: 'errors/SpruceError.ts',
			description: 'Starting error class that you can edit.',
			shouldOverwriteWhenChanged: false,
		},
		{
			path: '.spruce/skill.ts',
			description: 'Used to support booting the skill.',
			shouldOverwriteWhenChanged: true,
		},
		{
			path: '.spruce/errors/options.types.ts',
			description:
				'Holds all possible error codes and options. Will be updated as you create more errors (spruce create.error).',
			shouldOverwriteWhenChanged: false,
		},
		{
			path: 'src/.spruce/features/event.plugin.ts',
			description:
				'Gives your skill event support through local boot events and optionall Mercury (spruce event.listen).',
			shouldOverwriteWhenChanged: true,
		},
	]

	public constructor(options: FeatureOptions) {
		super(options)

		void this.emitter.on(
			`test.register-abstract-test-classes`,
			this.handleRegisterAbstractTestClasses.bind(this)
		)

		void this.emitter.on(
			'feature.will-execute',
			this.handleWillExecute.bind(this)
		)
	}

	private async handleRegisterAbstractTestClasses() {
		return {
			abstractClasses: [
				{
					name: 'AbstractSpruceFixtureTest',
					label: 'AbstractSpruceFixtureTest',
					import: '@sprucelabs/spruce-test-fixtures',
					featureCode: 'skill',
				},
			],
		}
	}

	public async beforePackageInstall(options: SkillFeatureOptions) {
		const { files } = await this.install(options)
		return { files, cwd: this.resolveDestination(options) }
	}

	public async afterPackageInstall(options: SkillFeatureOptions) {
		const destination = this.resolveDestination(options)
		await this.Store('skill', { cwd: destination }).setCurrentSkillsNamespace(
			options.name
		)
		return {}
	}

	private async install(options: SkillFeatureOptions) {
		validateSchemaValues(skillFeatureSchema, options)

		const destination = this.resolveDestination(options)
		if (!diskUtil.doesDirExist(destination)) {
			diskUtil.createDir(destination)
		}

		const skillGenerator = this.Writer('skill')

		const files = await skillGenerator.writeSkill(destination, options)

		await this.installScripts(destination)

		this.setEngines(destination)

		const env = this.Service('env', destination)
		env.set('SKILL_NAME', options.name)

		return { files }
	}

	private resolveDestination(options: SkillFeatureOptions) {
		return diskUtil.resolvePath(this.cwd, options.destination ?? '')
	}

	public async installScripts(destination = this.cwd) {
		const scriptUpdater = ScriptUpdater.FromFeature(this, {
			cwd: destination,
		})

		await scriptUpdater.update()
	}

	public setEngines(destination: string) {
		const pkg = this.Service('pkg', destination)
		const engines = (pkg.get('engines') as Record<string, string>) || {}

		for (const name in this.engines) {
			const all = this.engines
			engines[name] = this.engines[name as keyof typeof all]
		}

		pkg.set({ path: 'engines', value: engines })
	}

	public async handleWillExecute(options: {
		featureCode: string
		actionCode: string
		options?: UpgradeOptions
	}) {
		const { featureCode, actionCode, options: upgradeOptions } = options
		const isInstalled = await this.featureInstaller.isInstalled('skill')

		if (isInstalled && featureCode === 'node' && actionCode === 'upgrade') {
			const updater = new Updater(this)
			const files = await updater.updateFiles(upgradeOptions as any)
			return {
				files,
			}
		}

		return {}
	}
}
