import { SpruceSchemas } from '#spruce/schemas/schemas.types'
import setupVscodeSchema from '#spruce/schemas/spruceCli/v2020_07_22/setupVscodeOptions.schema'
import PkgService from '../../../services/PkgService'
import { NpmPackage } from '../../../types/cli.types'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'
import { Extension } from '../services/VsCodeService'

type OptionsSchema =
	SpruceSchemas.SpruceCli.v2020_07_22.SetupVscodeOptionsSchema
type Options = SpruceSchemas.SpruceCli.v2020_07_22.SetupVscodeOptions

export default class SetupAction extends AbstractAction<OptionsSchema> {
	public invocationMessage = 'Setting up Visual Studio Codez... 👾'
	private recommendedExtensions: Extension[] = [
		{
			id: 'dbaeumer.vscode-eslint',
			label: 'ESLint syntax validation and fixing',
		},
		{
			id: 'eg2.vscode-npm-script',
			label: 'NPM package.json validation and warnings',
		},
		{
			id: 'christian-kohler.npm-intellisense',
			label: 'Intellisense autocompletion of installed npm modules',
		},
		{
			id: 'mikestead.dotenv',
			label: '.env support',
		},
	]

	public optionsSchema = setupVscodeSchema
	private dependencies: NpmPackage[] = [
		{
			name: 'eslint',
			isDev: true,
		},
		{
			name: 'eslint-config-spruce',
			isDev: true,
		},
	]

	public async execute(options: Options): Promise<FeatureActionResponse> {
		const { all } = this.validateAndNormalizeOptions(options)

		this.ui.startLoading('Checking state of vscode.')

		const missing = await this.getMissingExtensions()
		const choices = missing.map((ext) => ({ value: ext.id, label: ext.label }))
		const response: FeatureActionResponse = {
			summaryLines: [],
		}

		const skipConfirmExtensions = all || missing.length === 0

		if (!skipConfirmExtensions) {
			this.ui.stopLoading()
		}

		await this.optionallyInstallVscodeExtensions(
			skipConfirmExtensions,
			missing,
			choices,
			response
		)

		this.ui.startLoading('Writing vscode configurations...')

		const files = await this.Writer('vscode').writeVsCodeConfigurations(
			this.cwd,
			!all
		)

		response.files = files
		response.packagesInstalled = []

		await this.optionallyInstallEsListModules(response, all)

		response.hints = [
			"Ok, now that that's done 😅, lets make sure Visual Studio Code can run tasks whenever you open this project.",
			'',
			'Step 1: Open the Command Palette (View -> Command Palette or cmd+shift+p) and type "Manage".',
			'Step 2: Select "Tasks: Manage Automatic Tasks in Folder".',
			'Step 3: Allow.',
			'Step 4: Open the Command Palette (cmd+shift+p)).',
			'Step 5: Select "Developer: Reload Window".',
			'💪',
		]

		return response
	}

	private async optionallyInstallVscodeExtensions(
		skipConfirmExtensions: boolean,
		missing: Extension[],
		choices: { value: string; label: string }[],
		response: FeatureActionResponse
	) {
		const answers = skipConfirmExtensions
			? missing.map((m) => m.id)
			: await this.ui.prompt({
					type: 'select',
					label: 'Which extensions should I install?',
					isArray: true,
					options: {
						choices,
					},
			  })

		if (answers && answers?.length > 0) {
			this.ui.startLoading(`Installing ${answers.length} extensions...`)

			for (const answer of answers) {
				response.summaryLines?.push(`Installed ${answer} extension.`)
			}

			await this.Service('vsCode').installExtensions(answers)

			this.ui.stopLoading()
		}
	}

	private async optionallyInstallEsListModules(
		response: FeatureActionResponse,
		all: boolean | undefined
	) {
		const pkg = this.Service('pkg')

		for (const module of this.dependencies) {
			if (!pkg.isInstalled(module.name)) {
				// eslint-disable-next-line @typescript-eslint/no-extra-semi
				;(response.packagesInstalled ?? []).push(module)
			}
		}

		if ((response.packagesInstalled ?? []).length > 0) {
			await this.installEsLintModules(all, response, pkg)
		}
	}

	private async installEsLintModules(
		all: boolean | undefined,
		response: FeatureActionResponse,
		pkg: PkgService
	) {
		this.ui.stopLoading()
		const shouldInstallPackages =
			all ||
			(await this.ui.confirm(
				'Last thing! Ready for me to install eslint modules?'
			))

		this.ui.startLoading('Installing dev dependencies')
		if (shouldInstallPackages) {
			for (const module of response.packagesInstalled ?? []) {
				await pkg.install(module.name, {
					isDev: module.isDev,
				})
			}
		}
	}

	private async getMissingExtensions() {
		const currentExtensions = await this.Service('vsCode').getVSCodeExtensions()

		const missingExtensions = this.recommendedExtensions.filter(
			(recommendedExtension) => {
				const currentExtension = currentExtensions.find(
					(e) => e === recommendedExtension.id
				)
				if (currentExtension) {
					return false
				}
				return true
			}
		)
		return missingExtensions
	}
}
