import { assertOptions } from '@sprucelabs/schema'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { templates } from '@sprucelabs/spruce-templates'

export default class EsLint9Migrator implements Migrator {
	public static disk = diskUtil
	public static Class?: new (options: MigratorOptions) => Migrator
	private cwd: string

	private constructor(options: MigratorOptions) {
		const { cwd } = options
		this.cwd = cwd
	}

	public static Migrator(options: MigratorOptions) {
		assertOptions(options, ['cwd'])
		return new (this.Class ?? this)(options)
	}

	public async migrate() {
		this.deleteFileIfExists('.eslintignore')
		this.deleteFileIfExists('.eslintrc.js')
		await this.updateVsCodeSettingsIfExists()
	}

	private async updateVsCodeSettingsIfExists() {
		const settings = await templates.vsCodeSettings()

		const destination = this.disk.resolvePath(
			this.cwd,
			'.vscode',
			'settings.json'
		)

		if (this.disk.doesFileExist(destination)) {
			this.disk.writeFile(destination, settings)
		}
	}

	private deleteFileIfExists(filename: string) {
		const path = this.disk.resolvePath(this.cwd, filename)
		if (this.disk.doesFileExist(path)) {
			this.disk.deleteFile(path)
		}
	}

	private get disk() {
		return EsLint9Migrator.disk
	}
}
export interface Migrator {
	migrate(): Promise<void>
}

export interface MigratorOptions {
	cwd: string
}
