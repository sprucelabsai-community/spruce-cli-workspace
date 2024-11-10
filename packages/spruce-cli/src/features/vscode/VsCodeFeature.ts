import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { FileDescription } from '../../types/cli.types'
import AbstractFeature from '../AbstractFeature'
import { FeatureCode } from '../features.types'

export default class VsCodeFeature extends AbstractFeature {
    public nameReadable = 'VSCode'
    public description = 'Create settings and install VSCode extensions'
    public code: FeatureCode = 'vscode'
    public actionsDir = diskUtil.resolvePath(__dirname, 'actions')

    public readonly fileDescriptions: FileDescription[] = [
        {
            path: '.vscode/launch.json',
            description: 'Sets you up for debugging in Visual Studio Code.',
            shouldOverwriteWhenChanged: true,
            confirmPromptOnFirstWrite: 'Want me to setup debugging for you?',
        },
        {
            path: '.vscode/settings.json',
            description:
                'Ties everything together for optimal team productivity.',
            shouldOverwriteWhenChanged: true,
            confirmPromptOnFirstWrite:
                'Want me to setup vscode settings for building, testing and linting on save?',
        },
        {
            path: '.vscode/tasks.json',
            description:
                'command+shift+t to open the Test Reporter, build watch on load, etc.',
            shouldOverwriteWhenChanged: true,
            confirmPromptOnFirstWrite:
                'Want me to start watchers when you start vscode?',
        },
    ]

    public isInstalled = async () => {
        const command = this.Service('command')

        try {
            await command.execute('which code')
        } catch (err) {
            return false
        }

        return true
    }
}

declare module '../../features/features.types' {
    interface FeatureMap {
        vscode: VsCodeFeature
    }
    interface FeatureOptionsMap {
        vscode: undefined
    }
}
