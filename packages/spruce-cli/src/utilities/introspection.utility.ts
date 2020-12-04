import _ from 'lodash'
import * as tsutils from 'tsutils'
import * as ts from 'typescript'

interface IntrospectionClass {
	className: string
	parentClassName: string
	parentClassPath: string
	optionsInterfaceName: string | undefined
	isAbstract: boolean
}

interface IntrospectionInterface {
	interfaceName: string
}

interface Introspection {
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
const serializeSymbol = (options: {
	checker: ts.TypeChecker
	symbol: ts.Symbol
}): DocEntry => {
	const { checker, symbol } = options
	return {
		name: symbol.getName(),
		documentation: ts.displayPartsToString(
			symbol.getDocumentationComment(checker)
		),
		type: checker.typeToString(
			checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration)
		),
	}
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
	/** Gather helpful details re: a class definition */
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
				ts.forEachChild(sourceFile, (node) => {
					// if this is a class declaration
					if (ts.isClassDeclaration(node) && node.name) {
						const symbol = checker.getSymbolAtLocation(node.name)

						if (symbol) {
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
								parentClassSymbol?.valueDeclaration.name.text
							// @ts-ignore
							const parentClassPath = parentClassSymbol?.parent
								.getName()
								.replace('"', '')

							const isAbstractClass = tsutils.isModifierFlagSet(
								node,
								ts.ModifierFlags.Abstract
							)
							details.constructors = constructorType
								.getConstructSignatures()
								.map((s) => serializeSignature({ signature: s, checker }))

							results.classes.push({
								className: node.name.text,
								parentClassName,
								parentClassPath,
								optionsInterfaceName:
									details.constructors?.[0].parameters?.[0]?.type,
								isAbstract: isAbstractClass,
							})
						}
					} else if (ts.isInterfaceDeclaration(node)) {
						results.interfaces.push({
							interfaceName: node.name.text,
						})
					}
				})
			}

			introspects.push(results)
		}

		return introspects
	},
}

export default introspectionUtil
