import { dirname } from 'path'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import _ from 'lodash'
import * as tsutils from 'tsutils'
import * as ts from 'typescript'

const serializeSymbol = (options: {
    checker: ts.TypeChecker
    symbol: ts.Symbol
}): DocEntry => {
    const { checker, symbol } = options
    const doc: DocEntry = {
        name: symbol.getName(),
        documentation: ts.displayPartsToString(
            symbol.getDocumentationComment(checker)
        ),
    }

    if (symbol.valueDeclaration) {
        doc.type = checker.typeToString(
            checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration)
        )
    }

    return doc
}

const serializeSignature = (options: {
    checker: ts.TypeChecker
    signature: ts.Signature
}) => {
    const { checker, signature } = options
    return {
        parameters: signature.parameters.map((p) =>
            serializeSymbol({ symbol: p, checker })
        ),
        returnType: checker.typeToString(signature.getReturnType()),
        documentation: ts.displayPartsToString(
            signature.getDocumentationComment(checker)
        ),
    }
}

const introspectionUtil = {
    introspect(tsFiles: string[]): Introspection[] {
        const filePaths = tsFiles
        const program = ts.createProgram(filePaths, {})
        const checker = program.getTypeChecker()

        // for building results
        const introspects: Introspection[] = []

        for (let i = 0; i < filePaths.length; i += 1) {
            const tsFile = filePaths[i]
            const sourceFile = program.getSourceFile(tsFile)
            const results: Introspection = { classes: [], interfaces: [] }
            if (sourceFile && _.includes(filePaths, sourceFile.fileName)) {
                if (!this.hasClassDefinition(sourceFile)) {
                    const exports = this.getExports(sourceFile)
                    const firstExport = exports[0]
                    if (firstExport) {
                        const declaration =
                            this.getClassDeclarationFromImportedFile(
                                firstExport,
                                dirname(tsFile),
                                program
                            )

                        if (declaration) {
                            const { classes, interfaces } =
                                getDeclarationsFromNode(
                                    declaration,
                                    checker,
                                    sourceFile
                                )
                            results.classes.push(...classes)
                            results.interfaces.push(...interfaces)
                        } else {
                            // must have imported from somewhere else (another node module)
                            const className = //@ts-ignore
                                firstExport.exportClause?.elements?.[0]
                                    ?.propertyName?.text

                            if (className) {
                                results.classes.push({
                                    className,
                                    classPath: tsFile,
                                    isAbstract: false,
                                    optionsInterfaceName: undefined,
                                    parentClassName: undefined,
                                    parentClassPath: undefined,
                                    staticProperties: {},
                                })
                            }
                        }
                    }
                } else {
                    ts.forEachChild(sourceFile, (node) => {
                        const { classes, interfaces } = getDeclarationsFromNode(
                            node,
                            checker,
                            sourceFile
                        )

                        results.classes.push(...classes)
                        results.interfaces.push(...interfaces)
                    })
                }
            }

            introspects.push(results)
        }

        return introspects
    },

    getExports(sourceFile: ts.SourceFile): ts.Node[] {
        const exports: ts.Node[] = []

        const traverse = (node: ts.Node) => {
            if (ts.isExportDeclaration(node)) {
                exports.push(node)
            }

            ts.forEachChild(node, traverse)
        }

        traverse(sourceFile)

        return exports
    },

    getClassDeclarationFromImportedFile(
        exportDeclaration: ts.Node,
        dirName: string,
        program: ts.Program
    ): ts.ClassDeclaration | undefined {
        if (!ts.isExportDeclaration(exportDeclaration)) {
            return undefined
        }

        const exportClause = exportDeclaration.exportClause
        if (!exportClause || !ts.isNamedExports(exportClause)) {
            return undefined
        }

        for (const element of exportClause.elements) {
            if (element.propertyName) {
                const propertyName = element.propertyName.text
                const moduleSpecifier = (
                    exportDeclaration.moduleSpecifier as ts.StringLiteral
                ).text

                const sourceFile = diskUtil.resolveFile(
                    dirName,
                    moduleSpecifier.replace(/^\.\//, '')
                )

                if (!sourceFile) {
                    return undefined
                }

                // Load the source file containing the class declaration
                const declarationSourceFile = program.getSourceFile(sourceFile)
                if (!declarationSourceFile) {
                    return undefined
                }

                const traverse = (
                    node: ts.Node
                ): ts.ClassDeclaration | undefined => {
                    if (
                        ts.isClassDeclaration(node) &&
                        node.name &&
                        node.name.text === propertyName
                    ) {
                        return node
                    }

                    for (const child of node.getChildren(
                        declarationSourceFile
                    )) {
                        const result = traverse(child)
                        if (result) {
                            return result
                        }
                    }

                    return undefined
                }

                return traverse(declarationSourceFile)
            }
        }

        return undefined
    },

    hasClassDefinition(sourceFile: ts.SourceFile): boolean {
        let hasClass = false

        const traverse = (node: ts.Node) => {
            if (ts.isClassDeclaration(node)) {
                hasClass = true
            }

            if (!hasClass) {
                ts.forEachChild(node, traverse)
            }
        }

        traverse(sourceFile)

        return hasClass
    },
}

export default introspectionUtil

function getDeclarationsFromNode(
    node: ts.Node,
    checker: ts.TypeChecker,
    sourceFile: ts.SourceFile
) {
    const classes: IntrospectionClass[] = []
    const interfaces: IntrospectionInterface[] = []

    // if this is a class declaration
    if (ts.isClassDeclaration(node) && node.name) {
        const symbol = checker.getSymbolAtLocation(node.name)

        if (symbol?.valueDeclaration) {
            const details = serializeSymbol({ checker, symbol })
            // Get the construct signatures
            const constructorType = checker.getTypeOfSymbolAtLocation(
                symbol,
                symbol.valueDeclaration
            )

            let parentClassSymbol: ts.Symbol | undefined
            if (node.heritageClauses && node.heritageClauses[0]) {
                parentClassSymbol = checker
                    .getTypeAtLocation(node.heritageClauses[0].types[0])
                    .getSymbol()
            }

            const parentClassName =
                // @ts-ignore
                parentClassSymbol?.valueDeclaration?.name?.text
            // @ts-ignore
            const parentClassPath = parentClassSymbol?.parent
                ?.getName()
                .replace('"', '')

            const isAbstractClass = tsutils.isModifierFlagSet(
                node,
                ts.ModifierFlags.Abstract
            )
            details.constructors = constructorType
                .getConstructSignatures()
                .map((s) => serializeSignature({ signature: s, checker }))

            classes.push({
                className: node.name.text,
                classPath: sourceFile.fileName,
                parentClassName,
                parentClassPath,
                staticProperties: pluckStaticProperties(node),
                optionsInterfaceName:
                    details.constructors?.[0].parameters?.[0]?.type,
                isAbstract: isAbstractClass,
            })
        }
    } else if (ts.isInterfaceDeclaration(node)) {
        interfaces.push({
            interfaceName: node.name.text,
        })
    }
    return { classes, interfaces }
}

function pluckStaticProperties(node: ts.ClassDeclaration): StaticProperties {
    const staticProps: StaticProperties = {}

    for (const member of node.members) {
        //@ts-ignore
        const name = member.name?.escapedText
        //@ts-ignore
        const value = member.initializer?.text

        if (name && value) {
            staticProps[name] = value
        }
    }

    return staticProps
}

export interface IntrospectionClass {
    className: string
    classPath: string
    parentClassName: string | undefined
    parentClassPath: string | undefined
    optionsInterfaceName: string | undefined
    isAbstract: boolean
    staticProperties: StaticProperties
}

type StaticProperties = Record<string, any>

interface IntrospectionInterface {
    interfaceName: string
}

export interface Introspection {
    classes: IntrospectionClass[]
    interfaces: IntrospectionInterface[]
}

interface DocEntry {
    name?: string
    fileName?: string
    documentation?: string
    type?: string
    constructors?: DocEntry[]
    parameters?: DocEntry[]
    returnType?: string
}
