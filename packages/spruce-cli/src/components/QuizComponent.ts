import {
	Schema,
	SchemaFieldsByName,
	SchemaFieldNames,
	SchemaError,
} from '@sprucelabs/schema'
import chalk from 'chalk'
import { shuffle } from 'lodash'
import { GraphicsInterface } from '../types/cli.types'
import FormComponent, {
	FormOptions,
	FormPresentationOptions,
} from './FormComponent'

interface QuizMultipleChoiceQuestion {
	type: 'select'
	question: string
	answers: string[]
}

interface QuizTextQuestion {
	type: 'text'
	question: string
	answer: string
}

interface QuizQuestions {
	[key: string]: QuizMultipleChoiceQuestion | QuizTextQuestion
}

enum AnswerValidity {
	Correct = 'correct',
	Incorrect = 'incorrect',
}

interface QuizPresentationOptions<T extends Schema, Q extends QuizQuestions>
	extends Omit<FormPresentationOptions<T>, 'fields'> {
	questions?: QuizAnswerFieldNames<Q>[]
	randomizeQuestions?: boolean
}

type QuizAnswerFieldNames<Q extends QuizQuestions> = Extract<keyof Q, string>

type QuizAnswers<Q extends QuizQuestions> = {
	[K in QuizAnswerFieldNames<Q>]: string
}

type QuizAnswerValidities<Q extends QuizQuestions> = {
	[K in QuizAnswerFieldNames<Q>]: AnswerValidity
}

type QuizPresentationResults<Q extends QuizQuestions> = {
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

interface QuizOptions<T extends Schema, Q extends QuizQuestions>
	extends Omit<FormOptions<T>, 'schema'> {
	/** Should we randomize the questions */
	randomizeQuestions?: boolean
	/** The questions we are asking */
	questions: Q
}

export default class QuizComponent<T extends Schema, Q extends QuizQuestions> {
	public formBuilder: FormComponent<T>
	public term: GraphicsInterface
	public randomizeQuestions = true
	public originalQuestions: QuizQuestions
	public lastResults?: QuizPresentationResults<Q>

	public constructor(options: QuizOptions<T, Q>) {
		// We're going to build a schema from the questions and pass that to the form builder
		const definition = this.buildSchemaFromQuestions(options.questions)

		// Track questions for later reference
		this.originalQuestions = options.questions

		// Construct new form builder
		this.formBuilder = new FormComponent<T>({
			...options,
			schema: definition,
		})

		// Set state locally
		this.term = options.ui
		this.randomizeQuestions = options.randomizeQuestions ?? true
	}

	/** Present the quiz */
	public async present(
		options: QuizPresentationOptions<T, Q> = {}
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
			const { field } =
				this.formBuilder
					.getNamedFields()
					.find((namedField) => namedField.name === fieldName) || {}

			if (!field) {
				throw new Error('Field issue in QuizComponent')
			}

			const fieldDefinition = field.definition

			switch (fieldDefinition.type) {
				case 'select':
					// Pull the original multiple choice, we can cast it as multiple choice
					// question with confidence
					answers[questionName] = (
						this.originalQuestions[questionName] as QuizMultipleChoiceQuestion
					).answers[parseInt(idx)]
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

	public async scorecard(
		options: {
			results?: QuizPresentationResults<Q>
			headline?: string
		} = {}
	) {
		const { headline, results = this.lastResults } = options
		const { term } = this

		if (!results) {
			throw new SchemaError({
				code: 'INVALID_PARAMETERS',
				parameters: [],
			})
		}

		term.clear()
		term.renderHero(headline ?? 'Quiz results!')

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
				case 'select':
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

		term.renderObject(testResults)

		term.renderLine(`# questions: ${results.totalQuestions}`)
		term.renderLine(`# correct: ${results.totalCorrect}`)

		term.renderHeadline(
			`Your score: ${(results.percentCorrect * 100).toFixed(1)}%`
		)

		await term.waitForEnter()
	}

	/** Takes questions and builds a schema */
	private buildSchemaFromQuestions(questions: QuizQuestions): T {
		// TODO change SchemaFields to something based on schema generated from questions
		const fields: SchemaFieldsByName = {}

		Object.keys(questions).forEach((fieldName) => {
			const question = questions[fieldName]

			switch (question.type) {
				case 'select':
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
