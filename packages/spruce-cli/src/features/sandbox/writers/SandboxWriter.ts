import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import AbstractWriter from '../../../writers/AbstractWriter'

export default class SandboxWriter extends AbstractWriter {
    public async writeDidBootListener(filepath: string) {
        const newContents = this.templates.sandboxWillBootListener()

        diskUtil.writeFile(filepath, newContents)

        await this.lint(filepath)
    }
}
