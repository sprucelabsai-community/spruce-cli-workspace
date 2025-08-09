import pathUtil from 'path'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import md5 from 'md5'
import SpruceError from '../errors/SpruceError'
import CommandServiceImpl from './CommandService'

export default class ImportService {
    public cwd: string

    private divider = '## SPRUCE-CLI DIVIDER ##'
    private errorDivider = '## SPRUCE-CLI ERROR DIVIDER ##'

    private static cachedImports: Record<string, Record<string, any>> = {}
    private static importCacheDir: string =
        diskUtil.createTempDir('import-service')
    private command: CommandServiceImpl
    private static isCachingEnabled: boolean

    public constructor(options: { cwd: string; command: CommandServiceImpl }) {
        this.cwd = options.cwd
        this.command = options.command
    }

    public importAll = async <T extends Record<string, any>>(
        file: string
    ): Promise<T> => {
        if (!ImportService.isCachingEnabled) {
            return this.importAllUncached(file)
        }

        const { hash, fileContents } = this.pullHashAndContents(file)

        if (!this.hasFileChanged(hash)) {
            const isDirty = this.haveImportsChanged(file, fileContents)

            if (!isDirty && ImportService.cachedImports[hash]) {
                return ImportService.cachedImports[hash] as T
            } else if (!isDirty) {
                ImportService.cachedImports[hash] = this.importAllCached(file)
                return ImportService.cachedImports[hash] as T
            }
        }

        ImportService.cachedImports[hash] = this.importAllUncached(file)
        const response = (await ImportService.cachedImports[hash]) as T
        this.writeCacheFile(hash, response)

        return response
    }

    private haveImportsChanged(
        originalFilepath: string,
        contents: string
    ): boolean {
        let changed = false
        let importMatches

        // only check files that start with dot because they are local and we can actually only check local files
        const regex =
            originalFilepath.search(/\.js$/i) > -1
                ? /require\(['"](\..*?)['"]\)/gis
                : /import.*["'](\..*?)["']/gis

        while ((importMatches = regex.exec(contents)) !== null) {
            try {
                const match = importMatches[1]
                const dir = pathUtil.dirname(originalFilepath)
                const nodeResolved = require.resolve(pathUtil.join(dir, match))
                const { hash } = this.pullHashAndContents(nodeResolved)

                if (this.hasFileChanged(hash)) {
                    changed = true
                }
            } catch {
                changed = true
            }
        }

        return changed
    }

    private writeCacheFile(hash: string, contents: Record<string, any>) {
        const destination = this.resolveCacheFile(hash)
        diskUtil.writeFile(destination, JSON.stringify(contents))
    }

    private importAllCached(file: string) {
        const { hash } = this.pullHashAndContents(file)

        const cacheFile = this.resolveCacheFile(hash)
        const contents = diskUtil.readFile(cacheFile)

        return JSON.parse(contents)
    }

    private importAllUncached = async <T extends Record<string, any>>(
        file: string
    ): Promise<T> => {
        let defaultImported: T | undefined

        if (!diskUtil.doesFileExist(file)) {
            throw new SpruceError({
                code: 'FAILED_TO_IMPORT',
                file,
                friendlyMessage: `I couldn't import ${file} because I couldn't find it!`,
            })
        }

        let args = [
            '-e',
            `"try { const imported = require('${file}');console.log('${this.divider}');console.log(JSON.stringify(imported)); } catch(err) { console.log('${this.errorDivider}');console.log(err.options ? err.toString() : err.stack); }"`,
        ]

        if (file.search(/\.ts$/i) > -1) {
            args = [
                '-r',
                'ts-node/register',
                '-r',
                'tsconfig-paths/register',
                ...args,
            ]
        }

        try {
            const { stdout } = await this.command.execute('node', {
                args,
            })

            const successParts = stdout.split(this.divider)
            const errParts = stdout.split(this.errorDivider)

            if (errParts.length > 1) {
                const proxyError = this.buildErrorFromExecuteResponse(
                    errParts,
                    file,
                    stdout
                )

                throw proxyError
            } else {
                defaultImported = JSON.parse(successParts[1])
            }
        } catch (err: any) {
            if (err instanceof SpruceError) {
                throw err
            } else {
                throw new SpruceError({
                    code: 'FAILED_TO_IMPORT',
                    file,
                    originalError: err,
                })
            }
        }

        return defaultImported as T
    }

    public importDefault = async <T extends Record<string, any>>(
        file: string
    ): Promise<T> => {
        const imported: any = await this.importAll(file)
        return imported.default as T
    }

    private buildErrorFromExecuteResponse(
        errParts: string[],
        file: string,
        stdout: string
    ) {
        let err: Record<string, any> = {}
        try {
            err = JSON.parse(errParts[1])
            if (!err.options) {
                throw Error('Capture and reported below')
            }
        } catch {
            err = {
                options: {
                    code: 'FAILED_TO_IMPORT',
                    file,
                    friendlyMessage: `Unknown error from import, output was: \n\n"${
                        errParts[1] ?? stdout
                    }"`,
                },
            }
        }

        const proxyError = new SpruceError(err.options)

        if (err.stack) {
            proxyError.stack = err.stack
        }
        return proxyError
    }

    public async bulkImport(files: string[]): Promise<any[]> {
        if (files.length === 0) {
            return []
        }
        const filepath = diskUtil.resolvePath(this.cwd, '.tmp')
        const filename = 'bulk-import-' + new Date().getTime() + '.ts'

        let imports = ``
        let exports = `export default [\n`

        let idx = 0
        for (const file of files) {
            const relative = pathUtil
                .relative(filepath, file)
                .replace(pathUtil.extname(file), '')

            imports += `import { default as import${idx}} from '${relative}'\n`
            exports += `import${idx},\n`
            idx++
        }

        exports += ']'

        const contents = imports + `\n\n` + exports
        const fullPath = pathUtil.join(filepath, filename)
        diskUtil.writeFile(fullPath, contents)

        try {
            const results = (await this.importDefault(fullPath)) as any[]

            return results as any
        } catch (err) {
            // if something failed, lets load one at a time until we find the one that failes
            for (const file of files) {
                const imported = await this.importDefault(file)
                if (!imported) {
                    throw new SpruceError({
                        code: 'FAILED_TO_IMPORT',
                        file,
                        friendlyMessage: `Looks like ${file} does not export default.`,
                    })
                }
            }

            throw err
        } finally {
            diskUtil.deleteDir(filepath)
        }
    }

    public static clearCache() {
        ImportService.cachedImports = {}
        diskUtil.deleteDir(this.cacheDir())
    }

    public static setCacheDir(cacheDir: string) {
        this.importCacheDir = cacheDir
    }

    public static disableCache() {
        this.isCachingEnabled = false
    }

    public static enableCaching() {
        this.isCachingEnabled = true
    }

    private hasFileChanged(hash: string) {
        const resolvedFilePath = this.resolveCacheFile(hash)
        return !diskUtil.doesFileExist(resolvedFilePath)
    }

    private resolveCacheFile(hash: string) {
        return diskUtil.resolvePath(ImportService.cacheDir(), hash + '.json')
    }

    private static cacheDir(): string {
        return this.importCacheDir
    }

    private pullHashAndContents(file: string) {
        const fileContents = diskUtil.readFile(file)
        const hash = md5(fileContents)
        return { hash, fileContents }
    }
}
