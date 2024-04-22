import { SchemaError } from '@sprucelabs/schema'
// import { ESLint } from 'eslint'
// import fs from 'fs-extra'
import SpruceError from '../errors/SpruceError'
import CommandService from './CommandService'

export default class LintService {
    public cwd: string
    private getCommand: () => CommandService

    private static isLintingEnabled = true

    public static disableLinting() {
        this.isLintingEnabled = false
    }

    public static enableLinting() {
        this.isLintingEnabled = true
    }

    public constructor(
        cwd: string,
        commandServiceFactory: () => CommandService
    ) {
        this.cwd = cwd
        this.getCommand = commandServiceFactory
    }

    public fix = async (pattern: string): Promise<string[]> => {
        if (!pattern) {
            throw new SchemaError({
                code: 'MISSING_PARAMETERS',
                parameters: ['pattern'],
            })
        }

        if (
            !LintService.isLintingEnabled ||
            pattern.includes('valueType.tmp')
        ) {
            return []
        }

        // let fixedFiles: any = {}
        const fixedPaths: string[] = []

        try {
            // const cli = new ESLint({ fix: true, cwd: this.cwd, cache: true })
            // fixedFiles = await cli.lintFiles([pattern])
            const script = `"(async function lint() { try { const { ESLint } = require('eslint'); const cli = new ESLint({ fix: true, cwd: '${this.cwd}' }); const result = await cli.lintFiles(['${pattern}']); ESLint.outputFixes(result); } catch (err) { console.log(err.toString()); }})()"`

            await this.getCommand().execute('node', {
                args: ['-e', script],
            })

            // fixedFiles = JSON.parse(stdout)
        } catch (err: any) {
            throw new SpruceError({
                code: 'LINT_FAILED',
                pattern,
                originalError: err,
            })
        }

        // if (fixedFiles) {
        //     for (const fixedFile of fixedFiles) {
        //         if (fixedFile?.output) {
        //             await fs.writeFile(fixedFile.filePath, fixedFile.output)
        //             fixedPaths.push(fixedFile.filePath)
        //         } else if (fixedFile?.messages && fixedFile?.errorCount > 0) {
        //             throw new SpruceError({
        //                 code: 'LINT_FAILED',
        //                 pattern,
        //                 friendlyMessage: `Lint error with '${
        //                     fixedFile.filePath
        //                 }':\n\n${fixedFile.messages
        //                     .map((m: any) => m?.message)
        //                     .join('\n')}`,
        //             })
        //         }
        //     }
        // }

        return fixedPaths
    }
}
