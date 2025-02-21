import globby from '@sprucelabs/globby'
import { assertOptions } from '@sprucelabs/schema'

export default class StaticTestFinderImpl implements StaticTestFinder {
    public static Class?: new () => StaticTestFinder

    public static Finder(): StaticTestFinder {
        return new (this.Class ?? this)()
    }

    public async find(lookupDir: string) {
        assertOptions({ lookupDir }, ['lookupDir'])

        const matches = await globby([
            `${lookupDir}/**/Abstract*Test.ts`,
            `${lookupDir}/**/*.test.ts`,
        ])

        return matches
    }
}

export interface StaticTestFinder {
    find(lookupDir: string): Promise<string[]>
}
