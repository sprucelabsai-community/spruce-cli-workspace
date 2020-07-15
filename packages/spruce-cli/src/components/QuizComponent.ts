import { SpruceErrorCode } from '@sprucelabs/error'
import {
	ISchemaDefinition,
	ISchemaDefinitionFields,
	SchemaFieldNames,
} from '@sprucelabs/schema'
import chalk from 'chalk'
import { shuffle } from 'lodash'
import FieldType from '#spruce/schemas/fields/fieldTypeEnum'
import SpruceError from '../errors/SpruceError'
import { IGraphicsInterface } from '../types/cli.types'
import FormComponent, {
	IFormOptions,
	IFormPresentationOptions,
} from './FormComponent'

/** Multiple choice question */
export interface IQuizMultipleChoiceQuestion {
	type: FieldType.Select
	/** The question to ask */
	question: string
	/** All answers, first one is correct  */
	answers: string[]
}

export interface IQuizTextQuestion {
	type: FieldType.Text
	/** The question to ask */
	question: string
	/** All answers, first one is correct  */
	answer: string
}

/** Quiz questions */
export interface IQuizQuestions {
	[key: string]: IQuizMultipleChoiceQuestion | IQuizTextQuestion
}

/** Answer status */
export enum AnswerValidity {
	Correct = 'correct',
	Incorrect = 'incorrect',
}

/** Options to present */
export interface IQuizPresentationOptions<
	T extends ISchemaDefinition,
	Q extends IQuizQuestions
> extends Omit<IFormPresentationOptions<T>, 'fields'> {
	/** Select which questions you want to output? random still applies */
	questions?: QuizAnswerFieldNames<Q>[]

	/** Overrides the randomize setting on the builder */
	randomizeQuestions?: boolean
}

/** All field names */
export type QuizAnswerFieldNames<Q extends IQuizQuestions> = Extract<
	keyof Q,
	string
>

/** The values returned by present */
export type QuizAnswers<Q extends IQuizQuestions> = {
	[K in QuizAnswerFieldNames<Q>]: string
}

/** Tracking of right/wrongs */
export type QuizAnswerValidities<Q extends IQuizQuestions> = {
	[K in QuizAnswerFieldNames<Q>]: AnswerValidity
}

/** Response from all questions */
export type QuizPresentationResults<Q extends IQuizQuestions> = {
	/** The answers that were given */
	answers: QuizAnswers<Q>

	/** The answers right or wrong */
	answerValidities: QuizAnswerValidities<Q>

	/** The percent of correct answers given  */
	percentCorrect: number

	/** How long it took them to take the quiz in ms */
	time: {
		startTimeMs: number
		endTimeMs: number
		totalTimeSec: number
	}

	/** How many were correct */
	totalCorrect: number

	/** How many were wrong */
	totalWrong: number

	/** How many questions we ended up taking */
	totalQuestions: number
}

/** Options for instantiating a new quiz */
export interface IQuizOptions<
	T extends ISchemaDefinition,
	Q extends IQuizQuestions
> extends Omit<IFormOptions<T>, 'definition'> {
	/** Should we randomize the questions */
	randomizeQuestions?: boolean
	/** The questions we are asking */
	questions: Q
}

export default class QuizComponent<
	T extends ISchemaDefinition,
	Q extends IQuizQuestions
> {
	public formBuilder: FormComponent<T>
	public term: IGraphicsInterface
	public randomizeQuestions = true
	public originalQuestions: IQuizQuestions
	public lastResults?: QuizPresentationResults<Q>

	public constructor(options: IQuizOptions<T, Q>) {
		// We're going to build a schema from the questions and pass that to the form builder
		const definition = this.buildSchemaFromQuestions(options.questions)

		// Track questions for later reference
		this.originalQuestions = options.questions

		// Construct new form builder
		this.formBuilder = new FormComponent<T>({
			...options,
			definition,
		})

		// Set state locally
		this.term = options.term
		this.randomizeQuestions = options.randomizeQuestions ?? true
	}

	/** Present the quiz */
	public async present(
		options: IQuizPresentationOptions<T, Q> = {}
	): Promise<QuizPresentationResults<Q>> {
		const {
			questions = this.formBuilder
				.getNamedFields()
				.map((nf) => nf.name) as QuizAnswerFieldNames<Q>[],
			randomizeQuestions = this.randomizeQuestions,
		} = options

		const startTime = new Date().getTime()

		// Pull out answers
		const fields = randomizeQuestions ? shuffle(questions) : questions

		// Ask for the answers
		const results = await this.formBuilder.present({
			...options,
			fields: fields as SchemaFieldNames<T>[],
		})

		// Generate stats
		const answers: Partial<QuizAnswers<Q>> = {}
		const answerValidities: Partial<QuizAnswerValidities<Q>> = {}

		const totalQuestions = questions.length
		let totalCorrect = 0

		const questionNames = Object.keys(results) as QuizAnswerFieldNames<Q>[]

		questionNames.forEach((questionName) => {
			const fieldName = questionName as SchemaFieldNames<T>
			const answer = (results[fieldName] as string) || ''
			const [validity, idx] = answer.split('-')

			// Get the field to tell type
			const field = this.formBuilder.getField(fieldName)
			const fieldDefinition = field.definition

			switch (fieldDefinition.type) {
				case FieldType.Select:
					// Pull the original multiple choice, we can cast it as multiple choice
					// question with confidence
					answers[questionName] = (this.originalQuestions[
						questionName
					] as IQuizMultipleChoiceQuestion).answers[parseInt(idx)]
					break
				default:
					// @ts-ignore TODO proper questions to schema should fix this because we only support a few fields
					answers[questionName] = results[fieldName]
			}

			// Track validity
			if (validity === AnswerValidity.Correct) {
				totalCorrect = totalCorrect + 1
				answerValidities[questionName] = AnswerValidity.Correct
			} else {
				answerValidities[questionName] = AnswerValidity.Incorrect
			}
		}, 0)

		const totalWrong = totalQuestions - totalCorrect

		// Track time
		const endTime = new Date().getTime()

		this.lastResults = {
			percentCorrect: totalCorrect / totalQuestions,
			totalCorrect,
			totalWrong,
			answerValidities: answerValidities as QuizAnswerValidities<Q>,
			answers: answers as QuizAnswers<Q>,
			totalQuestions,
			time: {
				startTimeMs: startTime,
				endTimeMs: endTime,
				totalTimeSec: +((endTime - startTime) / 1000).toFixed(1),
			},
		}

		return this.lastResults
	}

	/** Render the scorecard (last results by default) */
	public async scorecard(
		options: {
			results?: QuizPresentationResults<Q>
			headline?: string
		} = {}
	) {
		const { headline, results = this.lastResults } = options
		const { term } = this

		if (!results) {
			throw new SpruceError({
				code: SpruceErrorCode.InvalidParameters,
				parameters: [],
			})
		}

		term.clear()
		term.presentHero(headline ?? 'Quiz results!')

		const testResults: Record<string, string> = {}

		this.formBuilder.getNamedFields().forEach((namedField) => {
			const { name, field } = namedField
			const questionFieldName = name as QuizAnswerFieldNames<Q>

			// Get results
			const isCorrect =
				results.answerValidities[questionFieldName] === AnswerValidity.Correct
			const guessedAnswer = `${results.answers[questionFieldName]}`

			// Build the real answer
			let correctAnswer = ''

			const originalQuestion = this.originalQuestions[questionFieldName]

			switch (originalQuestion.type) {
				case FieldType.Select:
					correctAnswer = originalQuestion.answers[0]
					break
				default:
					// All options just pass through the answer tied to the question during instantiation
					correctAnswer = originalQuestion.answer
			}

			const objectKey = field.label || '**missing'

			if (isCorrect) {
				testResults[objectKey] = `${chalk.bgGreenBright.black(
					'Correct!'
				)} ${guessedAnswer} `
			} else {
				testResults[objectKey] = `${chalk.bgRedBright.black(
					'Wrong!'
				)}  ${chalk.strikethrough(guessedAnswer)} -> ${correctAnswer}`
			}
		})

		term.presentObject(testResults)

		term.writeLn(`# questions: ${results.totalQuestions}`)
		term.writeLn(`# correct: ${results.totalCorrect}`)

		term.presentHeadline(
			`Your score: ${(results.percentCorrect * 100).toFixed(1)}%`
		)

		await term.waitForEnter()
	}

	/** Takes questions and builds a schema */
	private buildSchemaFromQuestions(questions: IQuizQuestions): T {
		// TODO change ISchemaDefinitionFields to something based on schema generated from questions
		const fields: ISchemaDefinitionFields = {}

		Object.keys(questions).forEach((fieldName) => {
			const question = questions[fieldName]

			switch (question.type) {
				case FieldType.Select:
					fields[fieldName] = {
						type: question.type,
						label: question.question,
						options: {
							choices: shuffle(
								question.answers.map((question, idx) => ({
									value:
										idx === 0
											? `${AnswerValidity.Correct}-${idx}`
											: `${AnswerValidity.Incorrect}-${idx}`,
									label: question,
								}))
							),
						},
					}
					break
				default:
					fields[fieldName] = {
						type: question.type,
						label: question.question,
					}
			}
		})

		//@ts-ignore TODO better mapping of questions to schema definition
		const definition: T = {
			id: 'quizGenerated',
			name: 'Generated quiz',
			fields,
		}

		return definition
	}
}
