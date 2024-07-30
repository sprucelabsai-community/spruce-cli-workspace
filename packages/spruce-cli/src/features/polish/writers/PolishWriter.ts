import pathUtil from 'path'
import { namesUtil } from '@sprucelabs/spruce-skill-utils'
import AbstractWriter from '../../../writers/AbstractWriter'

export default class PolishWriter extends AbstractWriter {
    public async writePolishScript(
        destinationDir: string,
        skillNamespace: string
    ) {
        const filename = `${namesUtil.toKebab(skillNamespace)}.polish.ts`
        const resolvedDestination = pathUtil.join(destinationDir, filename)
        const content = this.templates.polish()

        const results = await this.writeFileIfChangedMixinResults(
            resolvedDestination,
            content,
            `Polish script at ${filename}!`
        )

        return results
    }
}
