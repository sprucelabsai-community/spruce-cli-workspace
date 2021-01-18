import AbstractSpruceError from '@sprucelabs/error'
import SchemaEntity, {
	Schema,
	SchemaAllValues,
	SchemaPartialValues,
	SchemaFieldNames,
	SelectChoice,
	SchemaError,
	IFieldDefinition,
} from '@sprucelabs/schema'
import { pick } from 'lodash'
import { FieldDefinitions } from '#spruce/schemas/fields/fields.types'
import SpruceError from '../errors/SpruceError'
import { GraphicsInterface } from '../types/cli.types'
import { GraphicsTextEffect } from '../types/graphicsInterface.types'

enum FormBuilderActionType {
	Done = 'done',
	Cancel = 'cancel',
	EditField = 'edit_field',
}

interface FormActionDone {
	type: FormBuilderActionType.Done
}

interface FormActionCancel {
	type: FormBuilderActionType.Cancel
}

type FormActionEditField<T extends Schema> = {
	type: FormBuilderActionType.EditField
	fieldName: SchemaFieldNames<T>
}

type FormAction<T extends Schema> =
	| FormActionDone
	| FormActionCancel
	| FormActionEditField<T>

export interface FormPresentationOptions<
	T extends Schema,
	F extends SchemaFieldNames<T> = SchemaFieldNames<T>
> {
	headline?: string
	showOverview?: boolean
	fields?: F[]
}

export interface FormOptions<T extends Schema> {
	term: GraphicsInterface
	schema: T
	initialValues?: SchemaPartialValues<T>
	onWillAskQuestion?: <K extends SchemaFieldNames<T>>(
		name: K,
		fieldDefinition: FieldDefinitions,
		values: SchemaPartialValues<T>
	) => FieldDefinitions
}

interface Handlers<T extends Schema> {
	onWillAskQuestion?: FormOptions<T>['onWillAskQuestion']
}

export default class FormComponent<S extends Schema> extends SchemaEntity<S> {
	public term: GraphicsInterface
	public handlers: Handlers<S> = {}

	public constructor(options: FormOptions<S>) {
		// Setup schema
		super(options.schema, options.initialValues)

		const { term } = options

		// Save term for writing, saving
		this.term = term

		// Handlers
		const { onWillAskQuestion } = options
		this.handlers.onWillAskQuestion = onWillAskQuestion
	}

	/** Pass me a schema and i'll give you back an object that conforms to it based on user input */
	public async present<F extends SchemaFieldNames<S> = SchemaFieldNames<S>>(
		options: FormPresentationOptions<S, F> = {}
	): Promise<Pick<SchemaAllValues<S>, F>> {
		const { term } = this
		const {
			headline,
			showOverview,
			fields = this.getNamedFields().map((nf) => nf.name),
		} = options

		let done = false
		let valid = false

		do {
			if (headline) {
				term.renderHeadline(headline, [GraphicsTextEffect.SpruceHeader])
				term.renderLine('')
			}

			if (showOverview) {
				// Overview mode
				const action = await this.renderOverview({ fields })

				switch (action.type) {
					case FormBuilderActionType.EditField: {
						// Editing a field
						const fieldName = action.fieldName
						const answer = await this.askQuestion(fieldName)

						// Set the new value
						this.set(fieldName, answer)

						break
					}
					case FormBuilderActionType.Done: {
						done = true
					}
				}
			} else {
				// Asking one question at a time
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

					await this.term.waitForEnter()
				}
			}
		} while (!done || !valid)

		const values = this.getValues({ fields, createEntityInstances: false })
		const cleanValues = pick(values, fields) as Pick<SchemaAllValues<S>, F>

		return cleanValues
	}

	/** Ask a question based on a field */
	public askQuestion<F extends SchemaFieldNames<S>>(fieldName: F) {
		const field = this.getNamedFields().find((nf) => nf.name === fieldName)
			?.field

		if (!field) {
			throw new Error(`No field named ${fieldName} on form ${this.schemaId}`)
		}

		let definition = { ...field.definition }
		const value = this.get(fieldName, {
			validate: false,
			createEntityInstances: false,
		})
		if (definition.isArray) {
			throw new SpruceError({
				code: 'NOT_IMPLEMENTED',
				friendlyMessage: 'Form builder does not support isArray yet',
			})
		}

		if (value) {
			definition.defaultValue = value as IFieldDefinition['defaultValue']
		}

		// Do we have a lister?
		if (this.handlers.onWillAskQuestion) {
			definition = this.handlers.onWillAskQuestion(
				fieldName,
				//@ts-ignore
				definition,
				(this.getValues({
					validate: false,
					createEntityInstances: false,
				}) as unknown) as SchemaPartialValues<S>
			)
		}

		return this.term.prompt(definition)
	}

	/** Pass it schema errors */
	public renderError(error: Error) {
		this.term.renderDivider()
		this.term.renderHeadline('Please fix the following...', [
			GraphicsTextEffect.Red,
			GraphicsTextEffect.Bold,
		])

		this.term.renderLine('')

		// Special handling for spruce errors
		if (error instanceof SchemaError) {
			const options = error.options

			switch (options.code) {
				// Invalid fields
				case 'INVALID_FIELD':
					// Output all errors under all fields
					options.errors.forEach((err) => {
						const { name, friendlyMessage, error, code } = err
						this.term.renderWarning(
							friendlyMessage ?? `${name}: ${code} ${error?.message}`
						)
					})
					break
				default:
					this.term.renderWarning(error.friendlyMessage())
			}
		} else if (error instanceof AbstractSpruceError) {
			this.term.renderWarning(error.friendlyMessage())
		} else {
			this.term.renderWarning(`Unexpected error ${error.message}`)
		}

		this.term.renderLine('')
	}

	/** Render every field and a select to chose what to edit (or done/cancel) */
	public async renderOverview<F extends SchemaFieldNames<S>>(
		options: { fields?: F[] } = {}
	): Promise<FormAction<S>> {
		const { term } = this
		const { fields = this.getNamedFields().map((nf) => nf.name) } = options

		// Track actions while building choices
		const actionMap: Record<string, FormAction<S>> = {}

		// Create all choices
		const choices: SelectChoice[] = this.getNamedFields()
			.filter((namedField) => fields.indexOf(namedField.name) > -1)
			.map((namedField) => {
				const { field, name } = namedField

				const actionKey = `field:${name}`
				const action: FormActionEditField<S> = {
					type: FormBuilderActionType.EditField,
					fieldName: name,
				}

				// Track the action for checking after selection
				actionMap[actionKey] = action

				// Get the current value, don't validate
				const value = this.get(name, { validate: false })

				return {
					value: actionKey,
					label: `${field.label}: ${value ? value : '***missing***'}`,
				}
			})

		// Done choice
		actionMap['done'] = {
			type: FormBuilderActionType.Done,
		}

		choices.push({
			value: 'done',
			label: 'Done',
		})

		const response = await term.prompt({
			type: 'select',
			isRequired: true,
			label: 'Select any field to edit',
			options: {
				choices,
			},
		})

		const action = actionMap[response]
		return action
	}
}
