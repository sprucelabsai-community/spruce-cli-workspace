import pathUtil from 'path'
import { TestOptions } from '@sprucelabs/spruce-templates'
import AbstractWriter from '../../../writers/AbstractWriter'

export default class TestGenerator extends AbstractWriter {
    public async generateTest(
        destinationDir: string,
        options: TestOptions & { type: string }
    ) {
        const { namePascal } = options
        const filename = `${namePascal}.test.ts`

        const resolvedDestination = pathUtil.join(destinationDir, filename)
        const testContent = this.templates.test(options)

        const results = await this.writeFileIfChangedMixinResults(
            resolvedDestination,
            testContent,
            `Your ${options.type} test.`
        )

        return results
    }
}
