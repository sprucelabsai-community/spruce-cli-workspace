import { CommanderStatic } from 'commander'

export type MockProgram = CommanderStatic['program'] & {
    actionHandler: (options: Record<string, string>) => Promise<void>
    descriptionInvocations: { command: string; description: string }[]
    optionInvocations: {
        command: string
        option: string
        hint: string
        defaultValue: string
    }[]
    _lastCommand: string
    commandInvocations: string[]
    actionInvocations: string[]
    aliasesInvocations: string[]
}

export default class MockProgramFactory {
    private constructor() {}

    public static Program(): MockProgram {
        // @ts-ignore
        return {
            _lastCommand: '',
            commandInvocations: [],
            descriptionInvocations: [],
            actionInvocations: [],
            optionInvocations: [],
            aliasesInvocations: [],
            commands: [],
            actionHandler: async (_options?: Record<string, string>) => {},
            command(str: string) {
                this.commandInvocations.push(str)
                this._lastCommand = str

                return this
            },
            //@ts-ignore
            description(str: string) {
                this.descriptionInvocations.push({
                    command: this._lastCommand,
                    description: str,
                })
                return this
            },
            //@ts-ignore
            aliases(aliases: string[]) {
                this.aliasesInvocations.push(...aliases)
                return this
            },
            action(cb: (...args: any[]) => Promise<void>) {
                this.actionInvocations.push(this._lastCommand)

                this.actionHandler = async (
                    options: Record<string, string>
                ) => {
                    await cb(options, {})
                }

                return this
            },
            //@ts-ignore
            option(option: string, hint: string, defaultValue: string) {
                this.optionInvocations.push({
                    command: this._lastCommand,
                    option,
                    hint,
                    defaultValue,
                })
                return this
            },
        }
    }
}
