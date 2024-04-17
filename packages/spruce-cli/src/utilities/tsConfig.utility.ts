import pathUtil from 'path'
import fs from 'fs-extra'
import SpruceError from '../errors/SpruceError'
const tsConfigUtil = {
    readConfig(dir: string): Record<string, any | undefined> {
        const source = dir
        const packagePath = pathUtil.join(source, 'tsconfig.json')
        const contents = fs.readFileSync(packagePath).toString()
        try {
            const parsed = JSON.parse(contents)
            return parsed
        } catch (err: any) {
            throw new SpruceError({
                code: 'FAILED_TO_IMPORT',
                file: packagePath,
                originalError: err,
            })
        }
    },

    setPathAlias(dir: string, alias: string, patterns: string[]) {
        const contents = this.readConfig(dir)
        const paths = contents.compilerOptions?.paths ?? {}

        // Set new path
        paths[alias] = patterns

        // Pass back to contents
        if (!contents.compilerOptions) {
            contents.compilerOptions = {}
        }

        contents.compilerOptions.paths = paths

        this.writeConfig(dir, contents)
    },

    writeConfig(dir: string, contents: Record<string, any>) {
        const destination = pathUtil.join(dir, 'tsconfig.json')
        fs.outputFileSync(destination, JSON.stringify(contents, null, 2))
    },

    setCompilerOption(
        dir: string,
        key: string,
        value: boolean | string | number
    ) {
        const contents = this.readConfig(dir)
        if (!contents.compilerOptions) {
            contents.compilerOptions = {}
        }

        contents.compilerOptions[key] = value

        this.writeConfig(dir, contents)
    },

    isPathAliasSet(dir: string, path: string) {
        return !!this.readConfig(dir).compilerOptions?.paths?.[path]
    },
}

export default tsConfigUtil
