import pathUtil from 'path'
import { ISchema } from '@sprucelabs/schema'
import { IFieldRegistration } from '@sprucelabs/schema'
import { versionUtil } from '@sprucelabs/spruce-skill-utils'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { CORE_NAMESPACE } from '@sprucelabs/spruce-skill-utils'
import globby from 'globby'
import { uniqBy } from 'lodash'
import SpruceError from '../errors/SpruceError'
import {
	personSchema,
	personLocationSchema,
	skillSchema,
	locationSchema,
	aclSchema,
} from '../temporary/schemas'
import AbstractStore from './AbstractStore'

interface IAddonItem {
	path: string
	registration: IFieldRegistration
	isLocal: boolean
}

export interface ISchemasByNamespace {
	[namespace: string]: ISchema[]
}

interface IFetchSchemasResults {
	schemasByNamespace: ISchemasByNamespace
	errors: SpruceError[]
}
export interface IFetchedField {
	path: string
	registration: IFieldRegistration
	isLocal: boolean
}

interface IFetchFieldsResults {
	errors: SpruceError[]
	fields: IFetchedField[]
}

export default class SchemaStore extends AbstractStore {
	public async fetchSchemas(options: {
		localSchemaDir?: string
		fetchRemoteSchemas?: boolean
		enableVersioning?: boolean
		localNamespace: string
	}): Promise<IFetchSchemasResults> {
		const {
			localSchemaDir = 'src/schemas',
			fetchRemoteSchemas = true,
			enableVersioning = true,
			localNamespace,
		} = options || {}

		const results: IFetchSchemasResults = {
			errors: [],
			schemasByNamespace: {},
		}

		if (fetchRemoteSchemas) {
			// TODO - move to mercury request when mercury-api is running
			results.schemasByNamespace[CORE_NAMESPACE] = [
				personSchema,
				skillSchema,
				locationSchema,
				personLocationSchema,
				aclSchema,
			]
		}

		const locals = await this.loadLocalSchemas(localSchemaDir, enableVersioning)
		results.schemasByNamespace[localNamespace] = locals.schemas
		results.errors.push(...locals.errors)

		return results
	}

	private async loadLocalSchemas(
		localLookupDir: string,
		enableVersioning?: boolean
	) {
		const localMatches = await globby(
			pathUtil.join(
				diskUtil.resolvePath(this.cwd, localLookupDir),
				'**/*.builder.[t|j]s'
			)
		)

		const schemaService = this.Service('schema')
		const errors: SpruceError[] = []
		const schemas: ISchema[] = []

		await Promise.all(
			localMatches.map(async (local) => {
				let version: undefined | string

				try {
					version =
						enableVersioning === false
							? undefined
							: versionUtil.extractVersion(this.cwd, local).dirValue
				} catch (err) {
					errors.push(
						new SpruceError({
							// @ts-ignore
							code: 'VERSION_MISSING',
							friendlyMessage: `It looks like your schema's are not versioned. Make sure schemas are in a directory like src/schemas/${
								versionUtil.generateVersion().dirValue
							}/*.ts`,
						})
					)
				}

				if (version || enableVersioning === false) {
					try {
						const schema = await schemaService.importSchema(local)
						schema.version = version

						schemas.push(schema)
					} catch (err) {
						errors.push(
							new SpruceError({
								code: 'SCHEMA_FAILED_TO_IMPORT',
								file: local,
								originalError: err,
							})
						)
					}
				}
			})
		)

		return {
			schemas,
			errors,
		}
	}

	public async fetchFields(options?: {
		localAddonsDir?: string
	}): Promise<IFetchFieldsResults> {
		const { localAddonsDir } = options || {}

		const cwd = pathUtil.join(__dirname, '..', '..')
		const localImportService = this.Service('import', cwd)

		// TODO load from mercury-api when live
		const coreAddonsPromise = Promise.all(
			(
				await globby([
					pathUtil.join(
						cwd,
						'node_modules/@sprucelabs/schema/build/addons/*Field.addon.js'
					),
				])
			).map(async (path) => {
				const registration = await localImportService.importDefault<
					IFieldRegistration
				>(path)

				return {
					path,
					registration,
					isLocal: false,
				}
			})
		)

		const localErrors: SpruceError[] = []
		const importService = this.Service('import')

		const localAddonsPromise =
			localAddonsDir &&
			Promise.all(
				(
					await globby([pathUtil.join(localAddonsDir, '/*Field.addon.[t|j]s')])
				).map(async (file) => {
					try {
						const registration = await importService.importDefault<
							IFieldRegistration
						>(file)

						return {
							path: file,
							registration,
							isLocal: true,
						}
					} catch (err) {
						localErrors.push(
							new SpruceError({
								code: 'FAILED_TO_IMPORT',
								file,
								originalError: err,
							})
						)
						return false
					}
				})
			)

		const [coreAddons, localAddons] = await Promise.all([
			coreAddonsPromise,
			localAddonsPromise || Promise.resolve([]),
		])

		const allFields = uniqBy(
			[
				...coreAddons,
				...(localAddons.filter((addon) => !!addon) as IAddonItem[]),
			],
			'registration.type'
		)

		return {
			fields: allFields,
			errors: localErrors,
		}
	}
}
