import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { ErrorTemplateItem } from '@sprucelabs/spruce-templates'
import { GeneratedFile } from '../../../types/cli.types'
import AbstractWriter, { WriteResults } from '../../../writers/AbstractWriter'

export default class ErrorWriter extends AbstractWriter {
    public async writeOrAppendErrorsToClass(
        destinationDir: string,
        errors: ErrorTemplateItem[]
    ): Promise<WriteResults> {
        let results: WriteResults = []

        if (errors.length === 0) {
            // todo move to proper error
            throw new Error('Need at least one error')
        }

        const resolvedDestination = diskUtil.resolvePath(
            destinationDir,
            `SpruceError.ts`
        )

        if (!diskUtil.doesFileExist(resolvedDestination)) {
            this.ui.startLoading('Creating Error class')

            const errorContents = this.templates.error({
                errors: errors.filter((error) => !error.isNested),
            })
            results = await this.writeFileIfChangedMixinResults(
                resolvedDestination,
                errorContents,
                'A new subclass of SpruceBaseError where you can control your error messaging.',
                results
            )
        } else {
            this.ui.startLoading('Updating Error class')

            const updates = await this.dropInNewErrorCases(
                errors,
                resolvedDestination
            )
            if (updates.length > 0) {
                results.push({
                    ...updates[0],
                    description: `${updates.length} new error cases were dropped in.`,
                })
            }
        }

        return results
    }

    private async dropInNewErrorCases(
        errors: ErrorTemplateItem[],
        destinationFile: string
    ) {
        let results: GeneratedFile[] = []

        for (const error of errors) {
            if (!error.isNested) {
                const dropInResults = await this.dropInErrorCaseIfMissing(
                    error,
                    destinationFile
                )
                results.push(...dropInResults)
            }
        }

        return results
    }

    private async dropInErrorCaseIfMissing(
        error: ErrorTemplateItem,
        destinationFile: string
    ) {
        let results: GeneratedFile[] = []
        const errorBlock = this.templates.error({
            errors: [error],
            renderClassDefinition: false,
        })

        // Try and drop in the block right before "default:"
        const currentErrorContents = diskUtil.readFile(destinationFile)
        const blockMatches = currentErrorContents.search(/default:/g)
        if (
            blockMatches > -1 &&
            !this.doesErrorCaseExist(currentErrorContents, error)
        ) {
            const newErrorContents =
                currentErrorContents.substring(0, blockMatches) +
                '\n' +
                errorBlock +
                '\n' +
                currentErrorContents.substring(blockMatches)

            results = await this.writeFileIfChangedMixinResults(
                destinationFile,
                newErrorContents,
                `A new block was added to handle ${error.code}.`,
                results
            )
        }
        return results
    }

    private doesErrorCaseExist(
        currentContents: string,
        error: ErrorTemplateItem
    ) {
        return currentContents.search(new RegExp(`case '${error.code}':`)) > -1
    }

    public async writeOptionsTypesFile(
        destinationDir: string,
        errorTemplateItems: ErrorTemplateItem[]
    ): Promise<WriteResults> {
        const contents = this.templates.errorOptionsTypes({
            options: errorTemplateItems,
        })

        const destination = diskUtil.resolvePath(
            destinationDir,
            'options.types.ts'
        )

        this.ui.startLoading('Updating error options...')

        const results = this.writeFileIfChangedMixinResults(
            destination,
            contents,
            'A union of all possible error codes and their options.'
        )

        return results
    }

    public async writePlugin(cwd: string) {
        const destination = diskUtil.resolveHashSprucePath(
            cwd,
            'features',
            'error.plugin.ts'
        )

        const pluginContents = this.templates.errorPlugin()

        const results = this.writeFileIfChangedMixinResults(
            destination,
            pluginContents,
            'Supports your skill with Error generation and handling.'
        )

        return results
    }
}
