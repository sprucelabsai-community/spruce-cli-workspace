export const argParserUtil = {
    parse(input: string) {
        if (input.length > 0) {
            const parts = input.split(' ')

            const args: Record<string, string> = {}
            let key: string | null = null

            for (const part of parts) {
                if (part[0] === '-') {
                    key = part.replace(/^--?/, '')
                } else if (key) {
                    args[key] = part
                    key = null
                }
            }

            if (key) {
                args[key] = 'true'
            }

            return args
        }
        return {}
    },
}
