import pathUtil from 'path'
import AbstractWriter from '../../../writers/AbstractWriter'

export default class PolishWriter extends AbstractWriter {
    public async writePolishScript(
        destinationDir: string,
        skillNamespace: string
    ) {
        const filename = `${skillNamespace}.polish.ts`
        const resolvedDestination = pathUtil.join(destinationDir, filename)
        const content = this.templates.polish()

        const results = await this.writeFileIfChangedMixinResults(
            resolvedDestination,
            content,
            `Polish script at ${filename}!`
        )

        await this.lint(resolvedDestination)

        return results
    }
}
