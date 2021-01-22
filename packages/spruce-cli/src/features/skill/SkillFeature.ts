import { validateSchemaValues } from '@sprucelabs/schema'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { SpruceSchemas } from '#spruce/schemas/schemas.types'
import skillFeatureSchema from '#spruce/schemas/spruceCli/v2020_07_22/skillFeature.schema'
import { FileDescription, NpmPackage } from '../../types/cli.types'
import AbstractFeature from '../AbstractFeature'
import { FeatureCode } from '../features.types'

type SkillFeatureSchema = SpruceSchemas.SpruceCli.v2020_07_22.SkillFeatureSchema
type Skill = SpruceSchemas.SpruceCli.v2020_07_22.SkillFeature

export default class SkillFeature<
	S extends SkillFeatureSchema = SkillFeatureSchema
> extends AbstractFeature<S> {
	public nameReadable = 'Skill'
	public code: FeatureCode = 'skill'
	public description =
		'Skill: The most basic configuration needed to enable a skill'
	public readonly installOrderWeight = 100

	public packageDependencies: NpmPackage[] = [
		{ name: '@sprucelabs/error' },
		{ name: '@sprucelabs/spruce-skill-utils' },
		{ name: '@sprucelabs/spruce-skill-booter' },
		{ name: '@sprucelabs/spruce-event-utils' },
		{ name: '@sprucelabs/spruce-event-plugin' },
		{ name: '@sprucelabs/spruce-core-schemas' },
		{ name: 'dotenv' },
		{ name: '@sprucelabs/babel-plugin-schema', isDev: true },
		{ name: '@types/node', isDev: true },
		{ name: 'typescript', isDev: true },
		{ name: 'ts-node', isDev: true },
		{ name: 'tsconfig-paths', isDev: true },
		{ name: '@babel/cli', isDev: true },
		{ name: '@babel/core', isDev: true },
		{ name: '@babel/plugin-proposal-class-properties', isDev: true },
		{ name: '@babel/plugin-proposal-decorators', isDev: true },
		{ name: '@babel/plugin-transform-runtime', isDev: true },
		{ name: '@babel/preset-env', isDev: true },
		{ name: '@babel/preset-typescript', isDev: true },
		{ name: 'babel-plugin-module-resolver', isDev: true },
		{ name: 'eslint', isDev: true },
		{ name: 'eslint-config-spruce', isDev: true },
		{ name: 'prettier', isDev: true },
		{ name: 'chokidar', isDev: true },
		{ name: 'concurrently', isDev: true },
		{ name: 'globby' },
		{
			name: '@sprucelabs/mercury-types',
		},
	]

	public optionsDefinition = skillFeatureSchema as S
	protected actionsDir = diskUtil.resolvePath(__dirname, 'actions')
	private scripts = {
		lint: "eslint '**/*.ts'",
		'fix.lint': "eslint --fix '**/*.ts'",
		'watch.lint':
			"concurrently 'yarn lint' \"chokidar 'src/**/*' -c 'yarn lint.tsc'\"",
		health: 'yarn boot --health',
		'health.local': 'yarn boot.local --health',
		build: 'yarn build.babel && yarn build.types.resolve-paths.lint',
		'build.types':
			'tsc --emitDeclarationOnly && echo PASS TYPES || echo FAIL TYPES',
		'build.babel':
			"babel src --out-dir build --extensions '.ts, .tsx' --source-maps --copy-files",
		'build.resolve-paths':
			'resolve-path-aliases --target build --patterns **/*.js,**/*.d.ts',
		'build.types.resolve-paths.lint':
			'yarn build.types && yarn resolve-paths.lint',
		'resolve-paths.lint': 'yarn build.resolve-paths && yarn lint',
		rebuild: 'yarn clean.all && yarn && yarn build',
		clean: 'rm -rf build/',
		'clean.all': 'yarn clean && rm yarn.lock | true && rm -rf node_modules/',
		boot: 'node build/index',
		'boot.local':
			'node -r ts-node/register -r tsconfig-paths/register ./src/index',

		'boot.sender': 'ACTION=sender node build/index',
		'boot.sender.local': 'ACTION=sender yarn boot.local',
		test: 'jest',
		'watch.tests': 'yarn test --watch',
		'watch.build':
			"concurrently 'yarn build.types.resolve-paths.lint' 'tsc --emitDeclarationOnly -w' 'yarn build.babel --watch' \"chokidar 'src/**/*' --ignore '.*/tmp/.*' -c 'yarn resolve-paths.lint'\"",
		'watch.rebuild': 'yarn clean.all && yarn && yarn build.watch',
		'upgrade.packages':
			'yarn-upgrade-all && rm yarn.lock ; yarn ; yarn fix.lint | true',
		'upgrade.packages.all': 'yarn install && yarn upgrade.packages',
		'upgrade.packages.test':
			'yarn upgrade.packages.all && yarn lint && yarn build && yarn test',
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
				'Used to support booting the skill. Will be updated as you create more errors.',
			shouldOverwriteWhenChanged: false,
		},
		{
			path: 'src/.spruce/features/event.plugin.ts',
			description:
				'Gives your skill event support through local boot events and Mercury.',
			shouldOverwriteWhenChanged: true,
		},
	]

	public async beforePackageInstall(options: Skill) {
		const { files } = await this.install(options)

		return { files }
	}

	private async install(
		options: SpruceSchemas.SpruceCli.v2020_07_22.SkillFeature
	) {
		validateSchemaValues(skillFeatureSchema, options)

		const skillGenerator = this.Writer('skill')

		const files = await skillGenerator.writeSkill(this.cwd, options)
		this.installScripts()

		return { files }
	}

	public installScripts() {
		const pkg = this.Service('pkg')
		const scripts = pkg.get('scripts') as Record<string, string>

		for (const name in this.scripts) {
			const all = this.scripts
			scripts[name] = this.scripts[name as keyof typeof all]
		}

		pkg.set({ path: 'scripts', value: scripts })
	}
}
