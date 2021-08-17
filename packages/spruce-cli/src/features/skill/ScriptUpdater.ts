import { SettingsService } from '@sprucelabs/spruce-skill-utils'
import PkgService from '../../services/PkgService'
import { GraphicsInterface } from '../../types/cli.types'

export default class ScriptUpdater {
	private pkg: PkgService
	private latestScripts: Record<string, any>
	private shouldConfirmIfScriptExistsButIsDifferent: boolean
	private ui: GraphicsInterface
	private settings: SettingsService<string>

	public constructor(options: {
		pkg: PkgService
		latestScripts: Record<string, any>
		shouldConfirmIfScriptExistsButIsDifferent?: boolean
		ui: GraphicsInterface
		settings: SettingsService
	}) {
		this.pkg = options.pkg
		this.latestScripts = options.latestScripts
		this.shouldConfirmIfScriptExistsButIsDifferent =
			options.shouldConfirmIfScriptExistsButIsDifferent ?? true
		this.ui = options.ui
		this.settings = options.settings
	}

	public async update() {
		const scripts = this.pkg.get('scripts') as Record<string, string>
		const all = this.latestScripts
		const oldScripts = this.pkg.get('scripts')

		let shouldConfirm = this.shouldConfirmIfScriptExistsButIsDifferent
		let shouldSkipAll = false
		const updaterSettings = this.settings.get('scriptUpdater') ?? { skips: [] }

		for (const name in this.latestScripts) {
			const script = this.latestScripts[name as keyof typeof all]
			const oldScript = oldScripts[name as any]

			let shouldWrite = !shouldSkipAll

			if (
				shouldConfirm &&
				!shouldSkipAll &&
				oldScript &&
				script !== oldScript &&
				updaterSettings.skips.indexOf(name) === -1
			) {
				this.ui.clear()
				this.ui.renderSection({
					headline: `Warning! You have modified \`${name}\` in your package.json and I'm trying to update it!`,
					object: {
						Current: oldScript,
						'    New': script,
					},
				})
				const desiredAction = await this.ui.prompt({
					type: 'select',
					label: 'What should I do?',
					options: {
						choices: [
							{
								label: 'Overwrite this one',
								value: 'overwrite',
							},
							{
								label: 'Skip this one',
								value: 'skip',
							},
							{
								label: 'Always skip',
								value: 'alwaysSkip',
							},
							{
								label: 'Skip all',
								value: 'skipAll',
							},
						],
					},
				})

				if (desiredAction === 'alwaysSkip') {
					updaterSettings.skips.push(name)
					shouldWrite = false
				} else if (desiredAction === 'skipAll') {
					shouldSkipAll = true
					shouldWrite = false
				} else if (desiredAction === 'skip') {
					shouldWrite = false
				}
			}

			if (shouldWrite) {
				scripts[name] = script
			}
		}

		this.settings.set('scriptUpdater', updaterSettings)
		this.pkg.set({ path: 'scripts', value: scripts })
	}
}
