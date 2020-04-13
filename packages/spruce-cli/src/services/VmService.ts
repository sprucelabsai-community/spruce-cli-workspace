import { NodeVM } from 'vm2'
import SpruceError from '../errors/SpruceError'
import { ErrorCode } from '#spruce/errors/codes.types'
import Schema, { ISchemaDefinition } from '@sprucelabs/schema'
import fs from 'fs-extra'
import path from 'path'
import { cloneDeep } from 'lodash'
import AbstractService from './AbstractService'

export default class VmService extends AbstractService {
	private fileMapCache: Record<string, string> = {}

	/** Import a schema definition from any file */
	public importDefinition(file: string) {
		let definitionProxy: ISchemaDefinition | undefined

		// Lets make sure there is a complimentary build for for this or we can't continue
		const builtFile =
			file.replace('.ts', '').replace('/src/', '/build/src/') + '.js'

		if (!fs.existsSync(builtFile)) {
			throw new SpruceError({
				code: ErrorCode.DefinitionFailedToImport,
				file,
				details: `It looks like you haven't built your project yet. try 'yarn watch'`
			})
		}

		// Construct new vm
		const vm = new NodeVM({
			sandbox: {
				define(def: { default: ISchemaDefinition }) {
					// Build initial definition
					definitionProxy = cloneDeep(def.default)
				}
			},
			require: {
				external: true,
				// Our own resolver for local files
				resolve: (name, dir) => {
					if (this.fileMapCache[name]) {
						return this.fileMapCache[name]
					}

					if (name === '#spruce/definition') {
						return builtFile
					}

					// There are a few options that could work
					const filePath = path.join(dir, name)
					const resolved = [
						filePath,
						filePath.replace('/src', '/build/src'),
						filePath.replace('/.spruce/', '/build/.spruce/'),
						path.join(filePath, 'index'),
						path.join(filePath, 'index').replace('/src', '/build/src'),
						path.join(filePath, 'index').replace('/.spruce/', '/build/.spruce/')
					]

					for (const path of resolved) {
						const filename = path + '.js'

						if (fs.existsSync(filename) && fs.lstatSync(filename).isFile()) {
							this.fileMapCache[name] = filename
							return filename
						}
					}

					throw new SpruceError({
						code: ErrorCode.DefinitionFailedToImport,
						file,
						details: `Could not resolve definition import "${name}". Tried ${resolved.join(
							', '
						)}`
					})
				}
			}
		})

		// Import source and transpile it
		const sourceCode = `
		require('ts-node').register();
		const definition = require("#spruce/definition");
define(definition);
		`

		// Run it
		vm.run(sourceCode, file)

		// Did the definition get fixed
		if (!definitionProxy) {
			throw new SpruceError({
				code: ErrorCode.DefinitionFailedToImport,
				file,
				details: `No proxy object was returned from the vm. The file probably does not have a definition.`
			})
		}

		// Is this a valid schema?
		if (!Schema.isDefinitionValid(definitionProxy)) {
			throw new SpruceError({
				code: ErrorCode.DefinitionFailedToImport,
				file: builtFile,
				details:
					'The definition imported is not valid. Make sure it is "export default build*Definition"'
			})
		}

		return definitionProxy as ISchemaDefinition
	}
}
