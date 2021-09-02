import { SchemaValues, validateSchemaValues } from '@sprucelabs/schema'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { SpruceSchemas } from '#spruce/schemas/schemas.types'
import skillFeatureSchema from '#spruce/schemas/spruceCli/v2020_07_22/skillFeature.schema'
import { FileDescription, NpmPackage } from '../../types/cli.types'
import ScriptUpdater from '../../updaters/ScriptUpdater'
import AbstractFeature, { FeatureOptions } from '../AbstractFeature'
import { FeatureCode } from '../features.types'
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
		{ name: '@sprucelabs/resolve-path-aliases', isDev: true },
		{ name: '@types/node', isDev: true },
		{ name: 'typescript', isDev: true },
		{ name: 'ts-node', isDev: true },
		{ name: 'tsconfig-paths', isDev: true },
		{ name: 'eslint', isDev: true },
		{ name: 'eslint-config-spruce', isDev: true },
		{ name: 'prettier', isDev: true },
		{ name: 'chokidar-cli', isDev: true },
		{ name: 'concurrently', isDev: true },
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
		build: 'yarn build.dev',
		'build.ci': 'yarn build.tsc && yarn build.resolve-paths && yarn lint',
		'build.dev': 'yarn build.tsc --sourceMap ; yarn resolve-paths.lint',
		'build.copy-files':
			"mkdir -p build && rsync -avzq --exclude='*.ts' ./src/ ./build/",
		'build.resolve-paths':
			"resolve-path-aliases --target build --patterns '**/*.js,**/*.d.ts'",
		'build.tsc': 'yarn build.copy-files && tsc',
		clean: 'yarn clean.build',
		'clean.all': 'yarn clean.dependencies && yarn clean.build',
		'clean.build': 'rm -rf build/',
		'clean.dependencies': 'rm -rf node_modules/ package-lock.json yarn.lock',
		'fix.lint': "eslint --fix --cache '**/*.ts'",
		health: 'yarn boot --health',
		'health.local': 'yarn boot.local --health',
		lint: "eslint --cache '**/*.ts'",
		rebuild: 'yarn clean.all && yarn && yarn build.dev',
		'update.dependencies': 'yarn clean.dependencies && yarn',
		'resolve-paths.lint': 'yarn build.resolve-paths ; yarn lint',
		test: 'jest',
		'upgrade.packages':
			'yarn-upgrade-all && rm -f yarn.lock ; yarn ; yarn fix.lint ; true',
		'upgrade.packages.all': 'yarn install && yarn upgrade.packages',
		'upgrade.packages.test':
			'yarn upgrade.packages.all && yarn lint && yarn build.dev && yarn test',
		'watch.build.dev':
			"concurrently 'yarn watch.tsc --sourceMap' \"chokidar 'src/**/*' --ignore '.*/tmp/.*' -c 'yarn build.copy-files && yarn build.resolve-paths'\"",
		'watch.lint':
			"concurrently 'yarn lint' \"chokidar 'src/**/*' -c 'yarn lint.tsc'\"",
		'watch.rebuild': 'yarn clean.all && yarn && yarn watch.build.dev',
		'watch.tsc': 'tsc -w',
	} as const

	public readonly fileDescriptions: FileDescription[] = [
		{
			path: '.eslintignore',
			description: 'Ignore things like build and node_module dirs.',
			shouldOverwriteWhenChanged: true,
		},
		{
			path: '.eslintrc.js',
			description: 'Extends Spruce configurations.',
			shouldOverwriteWhenChanged: true,
		},
		{
			path: '.gitignore',
			description: 'The usual suspects.',
			shouldOverwriteWhenChanged: false,
		},
		{
			path: '.gitignore',
			description: 'The usual suspects.',
			shouldOverwriteWhenChanged: false,
		},
		{
			path: '.nvmrc',
			description: 'Keep node at the latest.',
			shouldOverwriteWhenChanged: true,
		},
		{
			path: 'readme.md',
			description: "Don't forget to update this at some point.",
			shouldOverwriteWhenChanged: false,
		},
		{
			path: 'babel.config.js',
			description: 'Babel builds our skill for release.',
			shouldOverwriteWhenChanged: true,
		},
		{
			path: 'package.json',
			description: 'All dependencies and scripts.',
			shouldOverwriteWhenChanged: false,
		},
		{
			path: 'tsconfig.json',
			description: 'Maps #spruce paths.',
			shouldOverwriteWhenChanged: true,
		},
		{
			path: 'src/index.ts',
			description: 'The file that "boots" the skill.',
			shouldOverwriteWhenChanged: true,
		},
		{
			path: '.spruce/settings.json',
			description: 'Tracks things like which features are installed.',
			shouldOverwriteWhenChanged: false,
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

		if (featureCode === 'node' && actionCode === 'upgrade') {
			const updater = new Updater(this)
			const files = await updater.updateFiles(upgradeOptions as any)
			return {
				files,
			}
		}

		return {}
	}
}
