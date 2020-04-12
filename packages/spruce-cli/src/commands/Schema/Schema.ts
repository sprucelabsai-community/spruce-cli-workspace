import { Command } from 'commander'
import AbstractCommand from '../Abstract'
import { templates } from '@sprucelabs/spruce-templates'
import globby from 'globby'
import path from 'path'
import namedTemplateItemDefinition from '../../schemas/namedTemplateItem.definition'

export default class SchemaCommand extends AbstractCommand {
	/** Sets up commands */
	public attachCommands(program: Command) {
		/** Sync everything */
		program
			.command('schema:pull')
			.description('Pull all schema definitions down from the cloud')
			.option(
				'-d, --destinationDir <dir>',
				'Where should I write the types files?',
				'./.spruce/schemas'
			)
			.action(this.pull.bind(this))

		/** Create a new schema definition */
		program
			.command('schema:create [named]')
			.description('Define a new thing!')
			.option(
				'-dd, --definitionDestinationDir <definitionDir>',
				'Where should I write the definition file?',
				'./src/schemas'
			)
			.option(
				'-td --typesDestinationDir <typesDir>',
				'Where should I write the types file that supports the definition?',
				'./.spruce/schemas'
			)
			.action(this.create.bind(this))

		/** Generate schema definition types files */
		program
			.command('schema:sync')
			.description('Generates type files on all definition files.')
			.option(
				'-l, --lookupDir <lookupDir>',
				'Where should I look for definitions files (*.definition.ts)?',
				'./src/schemas'
			)
			.option(
				'-d, --destinationDir <destinationDir>',
				'Where should I write the definitions file?',
				'./.spruce/schemas'
			)

			.action(this.sync.bind(this))
	}

	/** Pull schemas from server */
	public async pull(cmd: Command) {
		const destinationDir = cmd.destinationDir as string

		// Make sure schema module is installed
		this.startLoading('Installing dependencies')
		await this.utilities.package.install('@sprucelabs/schema')
		this.utilities.tsConfig.setupForSchemas()
		this.startLoading('Fetching schemas and field types')

		// Load types and namespaces
		const schemaTemplateItems = await this.stores.schema.schemaTemplateItems()
		const fieldTemplateItems = await this.stores.schema.fieldTemplateItems()
		const typeMap = await this.stores.schema.fieldTypeMap()

		// Field Types
		const fieldTypesContent = templates.fieldTypes({
			fields: fieldTemplateItems
		})

		// Field type enum
		const fieldTypeContent = templates.fieldType({
			fields: fieldTemplateItems
		})

		// Schema types
		const schemaTypesContents = templates.schemaTypes({
			schemaTemplateItems,
			typeMap
		})

		this.stopLoading()

		this.info(
			`Found ${schemaTemplateItems.length} schema definitions and ${fieldTemplateItems.length} field types, writing files`
		)

		// Write out field types
		const fieldTypesDestination = this.resolvePath(
			destinationDir,
			'fields',
			'fields.types.ts'
		)

		await this.writeFile(fieldTypesDestination, fieldTypesContent)

		// Write out field type enum
		const fieldTypeDestination = this.resolvePath(
			destinationDir,
			'fields',
			'fieldType.ts'
		)

		await this.writeFile(fieldTypeDestination, fieldTypeContent)

		//Write out schema types
		const schemaTypesDestination = this.resolvePath(
			destinationDir,
			'schemas.types.ts'
		)
		await this.writeFile(schemaTypesDestination, schemaTypesContents)

		await this.pretty()
		await this.build()

		this.info(`All done 👊: ${schemaTypesDestination}`)
	}

	/** Generate types and other files based definitions */
	public async sync(cmd: Command) {
		const lookupDir = cmd.lookupDir as string
		const destinationDir = cmd.destinationDir as string
		const search = path.join(
			this.resolvePath(lookupDir),
			'**',
			'*.definition.ts'
		)

		// Make sure schema module is installed
		this.startLoading('Installing dependencies')
		await this.utilities.package.install('@sprucelabs/schema')
		this.utilities.tsConfig.setupForSchemas()
		this.stopLoading()

		const matches = await globby(search)

		matches.forEach(async filePath => {
			// Write to the destination
			const {
				pascalName,
				camelName,
				definition
			} = this.generators.schema.generateTypesFromDefinitionFile(
				filePath,
				this.resolvePath(destinationDir)
			)

			// Tell them how to use it
			this.headline(`${pascalName} examples:`)

			this.writeLn('')
			this.codeSample(
				this.templates.schemaExample({ pascalName, camelName, definition })
			)

			this.writeLn('')
			this.writeLn('')
		})
	}

	public async create(name: string | undefined, cmd: Command) {
		const readableName = name

		let camelName = ''
		let pascalName = ''

		let showOverview = false

		// If they passed a name, show overview
		if (readableName) {
			showOverview = true
			camelName = this.utilities.names.toCamel(readableName)
			pascalName = this.utilities.names.toPascal(camelName)
		}

		const form = this.formBuilder({
			definition: namedTemplateItemDefinition,
			initialValues: {
				readableName,
				camelName,
				pascalName
			},
			onWillAskQuestion: this.utilities.names.onWillAskQuestionHandler.bind(
				this.utilities.names
			)
		})

		// All the values
		const values = await form.present({
			showOverview,
			fields: ['readableName', 'camelName', 'pascalName', 'description']
		})

		// Make sure schema module is installed
		this.startLoading('Installing dependencies')
		await this.utilities.package.install('@sprucelabs/schema')
		this.stopLoading()

		// Build paths
		const definitionDestination = this.resolvePath(
			cmd.definitionDestinationDir as string,
			`${values.camelName}.definition.ts`
		)
		const typesDestination = this.resolvePath(cmd.typesDestinationDir as string)
		const definition = templates.definition(values)

		await this.writeFile(definitionDestination, definition)

		// Generate types
		const names = this.generators.schema.generateTypesFromDefinitionFile(
			definitionDestination,
			typesDestination
		)

		// Tell them how to use it
		this.headline(`${names.pascalName} examples:`)

		this.writeLn('')
		this.codeSample(
			this.templates.schemaExample({
				pascalName: names.pascalName,
				camelName: names.camelName,
				definition: names.definition
			})
		)
	}
}
