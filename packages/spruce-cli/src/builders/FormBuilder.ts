import Schema, {
	ISchemaDefinition,
	FieldType,
	SchemaDefinitionAllValues,
	SchemaDefinitionPartialValues,
	SchemaFieldNames,
	IFieldSelectDefinitionChoice,
	IFieldDefinition,
	SchemaErrorCode,
	SchemaError
} from '@sprucelabs/schema'
import ITerminal, { ITerminalEffect } from '../utilities/Terminal'
import { pick } from 'lodash'
import SpruceError from '../errors/Error'

export enum FormBuilderActionType {
	Done = 'done',
	Cancel = 'cancel',
	EditField = 'edit_field'
}

/** in overview mode, this is when the user selects "done" */
export interface IFormBuilderActionDone {
	type: FormBuilderActionType.Done
}

/** in overview mode, this is when the user select "cancel". TODO: in normal mode, this is if they escape out of the questions. */
export interface IFormBuilderActionCancel {
	type: FormBuilderActionType.Cancel
}

/** in overview mode, this is when the user selects to edit a field */
export type IFormBuilderActionEditField<T extends ISchemaDefinition> = {
	type: FormBuilderActionType.EditField
	fieldName: SchemaFieldNames<T>
}
/** actions that can be taken in overview mode */
export type IFormBuilderAction<T extends ISchemaDefinition> =
	| IFormBuilderActionDone
	| IFormBuilderActionCancel
	| IFormBuilderActionEditField<T>

/** controls for when presenting the form */
export interface IPresentationOptions<
	T extends ISchemaDefinition,
	F extends SchemaFieldNames<T>
> {
	headline?: string
	showOverview?: boolean
	fields?: F[]
}

export interface IFormBuilderOptions<T extends ISchemaDefinition> {
	onWillAskQuestion?: <K extends SchemaFieldNames<T>>(
		name: K,
		fieldDefinition: IFieldDefinition,
		values: SchemaDefinitionPartialValues<T>
	) => IFieldDefinition
}

interface IHandlers<T extends ISchemaDefinition> {
	onWillAskQuestion?: IFormBuilderOptions<T>['onWillAskQuestion']
}

export default class FormBuilder<T extends ISchemaDefinition> extends Schema<
	T
> {
	public term: ITerminal
	public handlers: IHandlers<T> = {}

	public constructor(
		term: ITerminal,
		definition: T,
		initialValues: SchemaDefinitionPartialValues<T> = {},
		options: IFormBuilderOptions<T> = {}
	) {
		// setup schema
		super(definition, initialValues)

		// save term for writing, saving
		this.term = term

		// handlers
		const { onWillAskQuestion } = options
		this.handlers.onWillAskQuestion = onWillAskQuestion
	}

	/** pass me a schema and i'll give you back an object that conforms to it based on user input */
	public async present<F extends SchemaFieldNames<T> = SchemaFieldNames<T>>(
		options: IPresentationOptions<T, F> = {}
	): Promise<Pick<SchemaDefinitionAllValues<T>, F>> {
		const { term } = this
		const {
			headline,
			showOverview,
			fields = Object.keys(this.fields) as F[]
		} = options

		let done = false
		let valid = false

		do {
			// hard to read as menus build on menus
			term.clear()

			// start with headline
			if (headline) {
				term.headline(headline)
				term.writeLn('')
			}

			if (showOverview) {
				// overview mode
				const action = await this.renderOverview({ fields })

				switch (action.type) {
					case FormBuilderActionType.EditField: {
						// editing a field
						const fieldName = action.fieldName
						const answer = await this.askQuestion(fieldName)

						// set the new value
						this.set(fieldName, answer)

						break
					}
					case FormBuilderActionType.Done: {
						done = true
					}
				}
			} else {
				// asking one question at a time
				const namedFields = this.getNamedFields({ fields })

				for (const namedField of namedFields) {
					const { name } = namedField
					const answer = await this.askQuestion(name)
					this.set(name, answer)
				}

				done = true
			}

			if (done) {
				try {
					this.validate({ fields })
					valid = true
				} catch (err) {
					this.renderError(err)
					await this.term.wait()
				}
			}
		} while (!done || !valid)

		const values = this.getValues({ fields })

		return pick(values, fields) as Pick<SchemaDefinitionAllValues<T>, F>
	}

	/** ask a question based on a field */
	public askQuestion<F extends SchemaFieldNames<T>>(fieldName: F) {
		const field = this.fields[fieldName]

		let definition = { ...field.definition }
		definition.defaultValue = this.values[fieldName]

		// do we have a lister?
		if (this.handlers.onWillAskQuestion) {
			definition = this.handlers.onWillAskQuestion(
				fieldName,
				definition,
				this.values
			)
		}

		return this.term.prompt(definition)
	}

	/** pass it schema errors */
	public renderError(error: Error) {
		this.term.bar()
		this.term.headline('Please fix the following...', [
			ITerminalEffect.Red,
			ITerminalEffect.Bold
		])

		this.term.writeLn('')

		// special handling for spruce errors
		if (error instanceof SchemaError || error instanceof SpruceError) {
			const options = error.options

			switch (options.code) {
				// invalid fields
				case SchemaErrorCode.InvalidField:
					// output all errors under all fields
					options.errors.forEach(error => {
						const { fieldName, errors } = error
						this.term.error(`field: ${fieldName} errors: ${errors.join(', ')}`)
					})
					break
				default:
					this.term.error(error.friendlyMessage())
			}
		} else if (error instanceof SpruceError) {
			this.term.error(error.friendlyMessage())
		} else {
			this.term.error(`Unexpected error ${error.message}`)
		}

		this.term.writeLn('')
	}

	/** render every field and a select to chose what to edit (or done/cancel) */
	public async renderOverview<F extends SchemaFieldNames<T>>(
		options: { fields?: F[] } = {}
	): Promise<IFormBuilderAction<T>> {
		const { term } = this
		const { fields = Object.keys(this.fields) } = options

		// track actions while building choices
		const actionMap: Record<string, IFormBuilderAction<T>> = {}

		// create all choices
		const choices: IFieldSelectDefinitionChoice[] = this.getNamedFields()
			.filter(namedField => fields.indexOf(namedField.name) > -1)
			.map(namedField => {
				const { field, name } = namedField

				const actionKey = `field:${name}`
				const action: IFormBuilderActionEditField<T> = {
					type: FormBuilderActionType.EditField,
					fieldName: name
				}

				// track the action for checking after selection
				actionMap[actionKey] = action

				// get the current value, don't validate
				const value = this.get(name, { validate: false })

				return {
					value: actionKey,
					label: `${field.getLabel()}: ${value ? value : '***missing***'}`
				}
			})

		// done choice
		actionMap['done'] = {
			type: FormBuilderActionType.Done
		}

		choices.push({
			value: 'done',
			label: 'Done'
		})

		const response = await term.prompt({
			type: FieldType.Select,
			isRequired: true,
			label: 'Select any field to edit',
			options: {
				choices
			}
		})

		const action = actionMap[response]
		return action
	}
}
