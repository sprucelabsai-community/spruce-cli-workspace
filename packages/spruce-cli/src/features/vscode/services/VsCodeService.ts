import semver from 'semver'
import CommandService from '../../../services/CommandService'

export default class VsCodeService extends CommandService {
    /** Returns whether or not vscode is installed */
    public async isInstalled(): Promise<boolean> {
        const isInstalled = false
        try {
            const { stdout } = await this.execute('code', {
                args: ['--version'],
            })

            const lines = stdout.split('\n')
            if (
                lines &&
                lines[0] &&
                semver.satisfies(lines[0], `>=${VSCODE_MINIMUM_VERSION}`)
            ) {
                return true
            }
        } catch (e) {}

        return isInstalled
    }

    public async getVSCodeExtensions(): Promise<string[]> {
        let extensions: string[] = []

        try {
            const { stdout } = await this.execute('code', {
                args: ['--list-extensions'],
            })

            extensions = stdout.split('\n')
        } catch (e) {}

        return extensions
    }

    public async installExtensions(extensionIds: string[]) {
        let args: string[] = []
        extensionIds.forEach((eId) => {
            args = args.concat('--install-extension', eId)
        })

        await this.execute('code', {
            args,
        })
    }
}

const VSCODE_MINIMUM_VERSION = '1.44.0'

export interface Extension {
    /** The vscode extension id like dbaeumer.vscode-eslint  */
    id: string
    /** A friendly name / description that will describe what the extension is or does */
    label: string
}
