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
        const isAbstractTest =
            /export\s+default\s+(?:abstract\s+class\b|class\s+(Abstract\w*))/m.test(
                contents
            )

        let cleanedUp = isAbstractTest
            ? contents.replaceAll(' static ', ' ')
            : contents.replace(
                  // Matches @test() or @seed(...) followed (on next line) by optional visibility and `static`.
                  /(@(?:(?:test|seed)\([\s\S]*?\))\s*\n\s*(?:public|protected)\s+)static\s+/g,
                  '$1'
              )

        // 2. Add `@suite()` above `export default class` if it's not already present
        if (!isAbstractTest && !cleanedUp.includes('@suite')) {
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
                `static async ${method}()`,
                `async ${method}()`
            )
        }

        cleanedUp = this.fixNonNullAssertions(cleanedUp)

        cleanedUp = cleanedUp.replaceAll('= >', '=>')
        cleanedUp = cleanedUp.replaceAll('! =', ' =')

        return cleanedUp
    }

    private hasSuiteImport(text: string): boolean {
        const pattern = new RegExp(
            `import\\s+(?:[\\s\\S]*?\\bsuite\\b[\\s\\S]*?)\\s+from\\s+['"]@sprucelabs/test-utils['"]`
        )
        return pattern.test(text)
    }

    private findThisCalls(contents: string): string[] {
        // Matches either `this.myProp` or `delete this.myProp`
        // if followed by space, punctuation, parentheses, or end of string
        const thisPropertyRegex = /(?:delete\s+)?this\.(\w+)(?=[\s.(),;]|$)/g
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
         * 1) Remove `static` for methods/getters/setters
         */
        const methodPattern = new RegExp(
            `((?:public|protected|private)?\\s+)?` + // group 1: optional visibility + space
                `static\\s+` + // literal 'static '
                `(?:(async)\\s+)?` + // group 2: 'async'?
                `(?:(get|set)\\s+)?` + // group 3: 'get' or 'set'?
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
         * 2) Remove `static` from property declarations, including those marked `readonly`.
         *    e.g.
         *    private static myProp => private myProp!
         *    private static readonly myProp => private readonly myProp!
         *    private static myProp?: Type => private myProp?: Type
         */
        const propertyPattern = new RegExp(
            `((?:public|protected|private)?\\s+)?` + // group 1: optional visibility + space
                `static\\s+` + // literal "static "
                `(readonly\\s+)?` + // group 2: optional "readonly " (with trailing space)
                `(${name})(\\?)?` + // group 3: property name, group 4: optional "?"
                `(?=[\\s=:\\[;]|$)`, // lookahead
            'g'
        )
        updated = updated.replace(propertyPattern, (match, g1, g2, g3, g4) => {
            // g1 => "private ", "protected ", or "public " (plus any spacing) or undefined
            // g2 => "readonly " if present, else undefined
            // g3 => property name (e.g. 'test')
            // g4 => "?" if property is optional, else undefined

            // If it's optional, keep the '?' or else add '!'
            // (Adjust if you'd rather remove the '!' in this step. Currently we're adding it if not optional.)
            const optionalChar = g4 ? g4 : '!'

            // Rebuild, dropping 'static' but retaining visibility + optional "readonly " + name + '?' or '!'
            return `${g1 ?? ''}${g2 ?? ''}${g3}${optionalChar}`
        })

        return updated
    }

    private fixNonNullAssertions(contents: string): string {
        const lines = contents.split('\n')

        const propertyRegex =
            /^(\s*)(public|protected|private)(\s+readonly)?\s+(\w+)\s*(!)?\s*:\s*([^=;]+)(=.*)?;?$/

        const updatedLines = lines.map((originalLine) => {
            // Skip lines containing "static"
            if (originalLine.includes('static')) {
                return originalLine
            }

            const match = originalLine.match(propertyRegex)
            if (!match) {
                return originalLine
            }

            let [
                ,
                leadingWhitespace,
                visibility,
                readonlyPart = '',
                propName,
                exclamation,
                typeDecl,
                assignment,
            ] = match

            // Trim trailing whitespace from the type
            typeDecl = typeDecl.trim()

            if (assignment) {
                // Remove the bang if there's an assignment
                exclamation = ''

                // Remove trailing semicolon
                assignment = assignment.replace(/;$/, '')

                // Ensure we always have " = " at the start
                // E.g. "=something" => " = something"
                assignment = assignment.replace(/^=\s*/, ' = ')
            } else {
                // No assignment? Add bang
                exclamation = '!'
            }

            // Rebuild line, preserving leading indentation
            const rebuilt = `${leadingWhitespace}${visibility}${readonlyPart} ${propName}${exclamation}: ${typeDecl}${assignment ?? ''}`
            return rebuilt
        })

        return updatedLines.join('\n')
    }
}

export interface StaticToInstanceTestFileMigrator {
    migrate(contents: string): string
}
