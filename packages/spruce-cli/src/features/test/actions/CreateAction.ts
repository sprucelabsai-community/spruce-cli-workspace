import pathUtil from 'path'
import { namesUtil } from '@sprucelabs/spruce-skill-utils'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { SpruceSchemas } from '#spruce/schemas/schemas.types'
import createTestActionSchema from '#spruce/schemas/spruceCli/v2020_07_22/createTestOptions.schema'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'
import TestFeature, { ParentClassCandidate } from '../TestFeature'

type OptionsSchema = SpruceSchemas.SpruceCli.v2020_07_22.CreateTestOptionsSchema
type Options = SpruceSchemas.SpruceCli.v2020_07_22.CreateTestOptions

export default class CreateAction extends AbstractAction<OptionsSchema> {
	public optionsSchema = createTestActionSchema
	public invocationMessage = 'Creating a test... 🛡'

	public async execute(options: Options): Promise<FeatureActionResponse> {
		const normalizedOptions = this.validateAndNormalizeOptions(options)
		const { testDestinationDir, namePascal, nameCamel, type } =
			normalizedOptions

		let resolvedDestination = diskUtil.resolvePath(
			this.cwd,
			testDestinationDir,
			type
		)

		this.ui.startLoading('Checking potential parent test classes')

		const testFeature = this.parent as TestFeature

		this.ui.stopLoading()

		let parentTestClass:
			| undefined
			| { name: string; importPath: string; isDefaultExport: boolean }

		const candidates = await testFeature.buildParentClassCandidates()

		if (diskUtil.doesDirExist(resolvedDestination)) {
			resolvedDestination = await this.promptForSubDir(
				resolvedDestination,
				type
			)
		}

		if (candidates.length > 0) {
			parentTestClass =
				await this.promptForParentTestClassAndOptionallyInstallDependencies(
					candidates,
					parentTestClass,
					resolvedDestination
				)
		}

		this.ui.startLoading('Generating test file...')

		const writer = this.Writer('test')

		const results = await writer.generateTest(resolvedDestination, {
			...normalizedOptions,
			type,
			nameCamel,
			parentTestClass,
			namePascal: namePascal ?? namesUtil.toPascal(nameCamel),
		})

		return {
			files: results,
			hints: ["run `spruce test` in your skill when you're ready!"],
		}
	}
	private async promptForSubDir(resolvedDestination: string, type: string) {
		const subdirs = diskUtil
			.readDir(resolvedDestination)
			.filter((d) =>
				diskUtil.isDir(diskUtil.resolvePath(resolvedDestination, d))
			)

		if (subdirs.length > 0) {
			const match = await this.ui.prompt({
				type: 'select',
				label: 'Where should I write this test?',
				isRequired: true,
				options: {
					choices: [
						{
							value: '.',
							label: `${type}`,
						},
						...subdirs.map((dir) => ({
							value: `${dir}`,
							label: `${type}/${dir}`,
						})),
					],
				},
			})

			resolvedDestination = diskUtil.resolvePath(resolvedDestination, match)
		}
		return resolvedDestination
	}

	private async promptForParentTestClassAndOptionallyInstallDependencies(
		candidates: ParentClassCandidate[],
		parentTestClass:
			| { name: string; importPath: string; isDefaultExport: boolean }
			| undefined,
		resolvedDestination: string
	) {
		const idx = await this.ui.prompt({
			type: 'select',
			isRequired: true,
			label: 'Which abstract test class do you want to extend?',
			options: {
				choices: [
					{ value: '', label: 'AbstractSpruceTest (default)' },
					...candidates.map((candidate, idx) => ({
						value: `${idx}`,
						label: candidate.label,
					})),
				],
			},
		})

		if (idx !== '' && candidates[+idx]) {
			const match = candidates[+idx]

			if (match) {
				await this.optionallyInstallFeatureBasedOnSelection(match)

				parentTestClass = this.buildParentClassFromCandidate(
					match,
					resolvedDestination
				)
			}
		}
		return parentTestClass
	}

	private async optionallyInstallFeatureBasedOnSelection(
		match: ParentClassCandidate
	) {
		if (match.featureCode) {
			const isInstalled = await this.features.isInstalled(match.featureCode)

			if (!isInstalled) {
				this.ui.startLoading(`Installing ${match.name}...`)
				await this.features.install({
					features: [{ code: match.featureCode as any }],
				})
				this.ui.stopLoading()
			}
		}
	}

	private buildParentClassFromCandidate(
		match: ParentClassCandidate,
		resolvedDestination: string
	): {
		name: string
		label: string
		importPath: string
		isDefaultExport: boolean
	} {
		return {
			name: match.name,
			label: match.label,
			isDefaultExport: match.isDefaultExport,
			importPath:
				match.import ??
				diskUtil.resolveRelativePath(
					resolvedDestination,
					//@ts-ignore
					match.path.replace(pathUtil.extname(match.path), '')
				),
		}
	}
}
