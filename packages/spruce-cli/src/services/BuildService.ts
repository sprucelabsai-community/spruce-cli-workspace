import CommandServiceImpl from './CommandService'
import LintService from './LintService'

export default class BuildService {
    public set cwd(cwd: string) {
        this.commandService.cwd = cwd
    }

    public get cwd() {
        return this.commandService.cwd
    }

    private commandService: CommandServiceImpl
    private lintService: LintService

    public constructor(
        commandService: CommandServiceImpl,
        lintService: LintService
    ) {
        this.commandService = commandService
        this.lintService = lintService
    }

    public async build(options?: { shouldFixLintFirst?: boolean }) {
        if (options?.shouldFixLintFirst !== false) {
            await this.lintService.fix('**/*.ts')
        }
        const results = await this.commandService.execute(`yarn build.dev`)
        return results
    }
}
