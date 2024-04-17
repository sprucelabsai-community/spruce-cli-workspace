import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import AbstractWriter from '../../../writers/AbstractWriter'

export default class DeployWriter extends AbstractWriter {
    public writePlugin(cwd: string) {
        const destination = diskUtil.resolveHashSprucePath(
            cwd,
            'features',
            'deploy.plugin.ts'
        )

        const pluginContents = this.templates.deployPlugin()

        const results = this.writeFileIfChangedMixinResults(
            destination,
            pluginContents,
            'Supports your skill with deploys!'
        )

        return results
    }
}
