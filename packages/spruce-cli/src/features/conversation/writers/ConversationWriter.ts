import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { GeneratedFile } from '../../../types/cli.types'
import AbstractWriter from '../../../writers/AbstractWriter'

export default class ConversationWriter extends AbstractWriter {
    public async writeDefinition(
        destinationDir: string,
        options: { nameCamel: string; nameReadable: string }
    ) {
        const { nameCamel, nameReadable } = options

        const filename = `${nameCamel}.topic.ts`
        const destination = diskUtil.resolvePath(
            destinationDir,
            'src',
            'conversations',
            filename
        )

        const contents = this.templates.conversationTopic({ nameReadable })

        diskUtil.writeFile(destination, contents)

        await this.lint(destination)

        const file: GeneratedFile = {
            name: filename,
            path: destination,
            action: 'generated',
            description: `The definition talking about ${nameReadable.toLowerCase()}`,
        }
        return file
    }

    public writePlugin(cwd: string) {
        const destination = diskUtil.resolveHashSprucePath(
            cwd,
            'features',
            'conversation.plugin.ts'
        )

        const pluginContents = this.templates.conversationPlugin()

        const results = this.writeFileIfChangedMixinResults(
            destination,
            pluginContents,
            'Supports your skill with having conversations.'
        )

        return results
    }
}
