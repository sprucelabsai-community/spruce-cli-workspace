import { isObjectLike } from 'lodash'

const commanderUtil = {
    mapIncomingToOptions(...args: any[]) {
        const strings = args.filter((a) => typeof a === 'string')
        const possibleSchema = args[args.length - 1]
        const schema =
            possibleSchema?.id && possibleSchema?.fields
                ? possibleSchema
                : undefined

        const originalOptions = args.find((a) => isObjectLike(a)) ?? {}
        const options: Record<string, any> = {}

        if (schema) {
            const fieldNames = Object.keys(schema.fields ?? {})
            for (let c = 0; c < strings.length; c++) {
                options[fieldNames[c]] = strings[c]
            }
        }

        return {
            ...originalOptions,
            ...options,
        }
    },
}

export default commanderUtil
