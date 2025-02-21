import { assertOptions } from '@sprucelabs/schema'

export default class StaticToInstanceTestFileMigratorImpl
    implements StaticToInstanceTestFileMigrator
{
    public static Class?: new () => StaticToInstanceTestFileMigrator

    public static Migrator() {
        return new (this.Class ?? this)()
    }

    public migrate(contents: string) {
        assertOptions({ contents }, ['contents'])

        // 1a. Remove `static ` only when it appears immediately before a method
        //    that has the `@test()` decorator
        // or
        // 1b. if the contents include `export default abstract class` remove `static` from all methods
        const includesAbstractExport = contents.includes(
            'export default abstract class'
        )
        let cleanedUp = includesAbstractExport
            ? contents.replaceAll(' static ', ' ')
            : contents.replace(
                  /(@test\(\)\s*\n\s*(?:protected|public)\s+)static\s+/g,
                  '$1'
              )

        // 2. Add `@suite()` above `export default class` if it's not already present
        if (!cleanedUp.includes('@suite')) {
            cleanedUp = cleanedUp.replace(
                /export default class/,
                '@suite()\nexport default class'
            )
        }

        // 3. Ensure `suite` is imported from `@sprucelabs/test-utils`
        if (!this.hasSuiteImport(cleanedUp)) {
            // If there's already `{ test`, just insert suite
            if (cleanedUp.includes('{ test')) {
                cleanedUp = cleanedUp.replace('{ test', '{ test, suite')
            } else {
                // Otherwise replace `test,` with `test,\n    suite,`
                cleanedUp = cleanedUp.replace('test,', 'test,\n    suite,')
            }
        }

        return cleanedUp
    }

    private hasSuiteImport(text: string): boolean {
        // Looks for `suite` as a standalone import from `@sprucelabs/test-utils`
        const pattern = new RegExp(
            `import\\s+(?:[\\s\\S]*?\\bsuite\\b[\\s\\S]*?)\\s+from\\s+['"]@sprucelabs/test-utils['"]`
        )
        return pattern.test(text)
    }
}

export interface StaticToInstanceTestFileMigrator {
    migrate(contents: string): string
}
