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
        // 1b. If the contents include `export default abstract class`,
        //     remove `static` from all methods
        const includesAbstractExport = contents.includes(
            'export default abstract class'
        )
        let cleanedUp = includesAbstractExport
            ? contents.replaceAll(' static ', ' ')
            : contents.replace(
                  // Matches @test() or @seed(...) followed (on next line) by optional visibility and `static`.
                  /(@(?:test\(\)|seed\([^)]*\))\s*\n\s*(?:public|protected)\s+)static\s+/g,
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
            if (cleanedUp.includes('{ test')) {
                cleanedUp = cleanedUp.replace('{ test', '{ test, suite')
            } else if (cleanedUp.includes('test }')) {
                cleanedUp = cleanedUp.replace('test }', 'test, suite }')
            } else {
                cleanedUp = cleanedUp.replace('test,', 'test,\n    suite,')
            }
        }

        const thisCallNames = this.findThisCalls(cleanedUp)
        for (const name of thisCallNames) {
            cleanedUp = this.removeStaticFromDeclaration(cleanedUp, name)
        }

        // 4. lifecicle methods
        const methods = ['beforeEach', 'afterEach']
        for (const method of methods) {
            cleanedUp = cleanedUp.replace(
                `protected static async ${method}()`,
                `protected async ${method}()`
            )
        }

        return cleanedUp
    }

    private hasSuiteImport(text: string): boolean {
        const pattern = new RegExp(
            `import\\s+(?:[\\s\\S]*?\\bsuite\\b[\\s\\S]*?)\\s+from\\s+['"]@sprucelabs/test-utils['"]`
        )
        return pattern.test(text)
    }

    private findThisCalls(contents: string): string[] {
        // Matches `this.myProp` if followed by space, punctuation, parentheses, or end of string
        const thisPropertyRegex = /this\.(\w+)(?=[\s.(),;]|$)/g
        const names: string[] = []
        let match: RegExpExecArray | null

        while ((match = thisPropertyRegex.exec(contents)) !== null) {
            const propName = match[1]
            if (!names.includes(propName)) {
                names.push(propName)
            }
        }

        return names
    }

    private removeStaticFromDeclaration(
        contents: string,
        name: string
    ): string {
        /**
         * 1) Remove `static` for methods/getters/setters, e.g.:
         *    private static async doSomething() => private async doSomething()
         *    private static get value() => private get value()
         *    private static set value(v) => private set value(v)
         */
        const methodPattern = new RegExp(
            `((?:public|protected|private)?\\s+)?` + // group 1
                `static\\s+` + // literal "static "
                `(?:(async)\\s+)?` + // group 2: "async"?
                `(?:(get|set)\\s+)?` + // group 3: "get" or "set"?
                `(${name})\\s*\\(`, // group 4: the identifier + '('
            'g'
        )
        let updated = contents.replace(
            methodPattern,
            (match, g1, g2, g3, g4) => {
                const asyncPart = g2 ? g2 + ' ' : ''
                const accessorPart = g3 ? g3 + ' ' : ''
                // Rebuild the declaration without "static"
                return `${g1 ?? ''}${asyncPart}${accessorPart}${g4}(`
            }
        )

        /**
         * 2) Remove `static` from property declarations and add a non-null assertion.
         *    e.g.
         *    private static myProp: Type => private myProp!: Type
         */
        const propertyPattern = new RegExp(
            `((?:public|protected|private)?\\s+)?` + // group 1: optional visibility
                `static\\s+` + // literal "static "
                `(${name})` + // group 2: the property name
                `(?=[\\s=:\\[;]|$)`, // lookahead: space, '=', ':', '[', ';', or end-of-string
            'g'
        )
        updated = updated.replace(propertyPattern, (match, g1, g2) => {
            // g1 = "private " / "public " / "protected " or empty
            // g2 = property name
            return `${g1 ?? ''}${g2}!`
        })

        return updated
    }
}

export interface StaticToInstanceTestFileMigrator {
    migrate(contents: string): string
}
