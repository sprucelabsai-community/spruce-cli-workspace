import { spawn, SpawnOptions, ChildProcess } from 'child_process'
import { Writable } from 'stream'
import AbstractSpruceError from '@sprucelabs/error'
import { ERROR_DIVIDER } from '@sprucelabs/spruce-skill-utils'
import escapeRegExp from 'lodash/escapeRegExp'
import stringArgv from 'string-argv'
import treeKill from 'tree-kill'
import SpruceError from '../errors/SpruceError'

process.setMaxListeners(100)

export default class CommandService {
    public cwd: string
    private activeChildProcess: ChildProcess | undefined
    private ignoreCloseErrors = false
    private static fakeResponses: {
        command: string | RegExp
        response: FakedCommandResponse
    }[] = []
    private static commandsRunCapturedByMockResponses: string[] = []

    public constructor(cwd: string) {
        this.cwd = cwd
    }

    public async execute(
        cmd: string,
        options?: {
            ignoreErrors?: boolean
            args?: string[]
            shouldStream?: boolean
            outStream?: Writable
            onError?: (error: string) => void
            onData?: (data: string) => void
            spawnOptions?: SpawnOptions
            forceColor?: boolean
            env?: Record<string, any>
        }
    ): Promise<{
        stdout: string
    }> {
        const cwd = this.cwd
        const args = options?.args || stringArgv(cmd)
        const executable = options?.args ? cmd : args.shift()
        const boundKill = this.kill.bind(this)

        if (!executable) {
            throw new Error('Bad params sent to command service')
        }

        const { mockResponse, mockKey } = this.getMockResponse(executable, args)

        if (mockResponse) {
            CommandService.commandsRunCapturedByMockResponses.push(mockKey)
            mockResponse.callback?.(executable, args)

            if (mockResponse.code !== 0) {
                throw new SpruceError({
                    code: 'EXECUTING_COMMAND_FAILED',
                    cmd: `${executable} ${args.join(' ')}`,
                    cwd,
                    stdout: mockResponse.stdout,
                    stderr: mockResponse.stderr,
                })
            }

            return { stdout: mockResponse.stdout ?? '' }
        }

        process.on('exit', boundKill)

        return new Promise((resolve, reject) => {
            let stdout = ''
            let stderr = ''
            const spawnOptions: SpawnOptions = options?.shouldStream
                ? {
                      stdio: 'inherit',
                      cwd,
                      env: {
                          PATH: process.env.PATH,
                          IS_CLI: 'true',
                          FORCE_COLOR: options?.forceColor ? '1' : '0',
                          ...options?.env,
                      },
                  }
                : {
                      cwd,
                      env: {
                          PATH: process.env.PATH,
                          IS_CLI: 'true',
                          FORCE_COLOR: options?.forceColor ? '1' : '0',
                          ...options?.env,
                      },
                      shell: true,
                      ...options?.spawnOptions,
                  }

            const child = spawn(executable, args, spawnOptions)
            this.activeChildProcess = child

            if (options?.outStream) {
                child.stdout?.pipe(options.outStream)
            }

            child.stdout?.addListener('data', (data) => {
                options?.onData?.(data.toString())
                stdout += data
            })

            child.stderr?.addListener('data', (data) => {
                options?.onError?.(data.toString())
                stderr += data
            })

            const closeHandler = (code: number) => {
                process.off('exit', boundKill)

                if (!this.activeChildProcess) {
                    return
                }
                this.activeChildProcess = undefined

                setTimeout(() => {
                    child.stdout?.removeAllListeners()
                    child.stderr?.removeAllListeners()
                    child.removeAllListeners()

                    if (
                        code === 0 ||
                        this.ignoreCloseErrors ||
                        options?.ignoreErrors
                    ) {
                        resolve({ stdout })
                        this.ignoreCloseErrors = false
                    } else {
                        if (stderr.search(escapeRegExp(ERROR_DIVIDER)) > -1) {
                            const stderrParts = stderr.split(ERROR_DIVIDER)
                            const err = AbstractSpruceError.parse(
                                stderrParts[1],
                                SpruceError
                            )
                            reject(err)
                            return
                        }

                        reject(
                            new SpruceError({
                                code: 'EXECUTING_COMMAND_FAILED',
                                cmd: `${executable} ${args.join(' ')}`,
                                cwd,
                                stdout,
                                stderr,
                            })
                        )
                    }
                }, 0)
            }

            child.addListener('close', closeHandler)
            child.addListener('exit', closeHandler)
        })
    }

    public kill = () => {
        if (this.activeChildProcess?.pid) {
            this.ignoreCloseErrors = true
            treeKill(this.activeChildProcess.pid, 'SIGTERM')
        }
    }

    public pid = () => {
        return this.activeChildProcess?.pid
    }

    private getMockResponse(executable: string, args: string[]) {
        const mockKey = `${executable} ${args.join(' ')}`.trim()
        const commands = CommandService.fakeResponses
        const match = commands.find((r) =>
            r.command instanceof RegExp
                ? mockKey.search(r.command) > -1
                : r.command.replace(/ +/gis, '') ===
                  mockKey.replace(/ +/gis, '')
        )

        return { mockResponse: match?.response, mockKey }
    }

    public static fakeCommand(
        command: string | RegExp,
        response: FakedCommandResponse
    ) {
        this.fakeResponses.unshift({
            command,
            response,
        })
    }

    public static clearFakedResponses() {
        this.fakeResponses = []
    }
}

export type FakedCommandCallback = (executable: string, args: any[]) => void

interface FakedCommandResponse {
    code: number
    stdout?: string
    stderr?: string
    callback?: FakedCommandCallback
}
