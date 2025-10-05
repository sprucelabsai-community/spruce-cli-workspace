import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import AbstractWriter from '../../../writers/AbstractWriter'

export default class AgentWriter extends AbstractWriter {
    public async writePlugin(cwd: string) {
        const destination = diskUtil.resolveHashSprucePath(
            cwd,
            'features',
            'agent.plugin.ts'
        )

        const pluginContents = this.templates.agentPlugin()

        const results = await this.writeFileIfChangedMixinResults(
            destination,
            pluginContents,
            'Supports your skill with registering ai agents.'
        )

        return results
    }

    public async writeSystemPrompt(
        destinationDir: string,
        options: {
            name: string
        }
    ) {
        const destination = this.resolveSystemPromptPath(destinationDir)

        const promptContents = this.templates.agentSystemPrompt({
            name: options.name,
        })

        const results = await this.writeFileIfChangedMixinResults(
            destination,
            promptContents,
            `The prompt file that defines how your AI Platform Agent behaves.`
        )

        return results
    }

    public resolveSystemPromptPath(destinationDir: string) {
        const filename = 'SYSTEM_PROMPT.md'
        const destination = diskUtil.resolvePath(
            destinationDir,
            'agents',
            filename
        )
        return destination
    }
}
