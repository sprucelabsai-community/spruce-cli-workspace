import chalk from 'chalk'
import Debug from 'debug'
import {
	FieldType,
	FieldDefinitionMap,
	IFieldDefinition,
	Field,
	FieldSelect,
	FieldClassMap
} from '@sprucelabs/schema'
import inquirer from 'inquirer'
import ora from 'ora'

let fieldCount = 0
function generateInquirerFieldName() {
	fieldCount++
	return `field-${fieldCount}`
}

export enum ITerminalEffect {
	Reset = 'reset',
	Bold = 'bold',
	Dim = 'dim',
	Italic = 'italic',
	Underline = 'underline',
	Inverse = 'inverse',
	Hidden = 'hidden',
	Strikethrough = 'strikethrough',
	Visible = 'visible',
	Black = 'black',
	Red = 'red',
	Green = 'green',
	Yellow = 'yellow',
	Blue = 'blue',
	Magenta = 'magenta',
	Cyan = 'cyan',
	White = 'white',
	Gray = 'gray',
	Grey = 'grey',
	BlackBright = 'blackBright',
	RedBright = 'redBright',
	GreenBright = 'greenBright',
	YellowBright = 'yellowBright',
	BlueBright = 'blueBright',
	MagentaBright = 'magentaBright',
	CyanBright = 'cyanBright',
	WhiteBright = 'whiteBright',
	BgBlack = 'bgBlack',
	BgRed = 'bgRed',
	BgGreen = 'bgGreen',
	BgYellow = 'bgYellow',
	BgBlue = 'bgBlue',
	BgMagenta = 'bgMagenta',
	BgCyan = 'bgCyan',
	BgWhite = 'bgWhite',
	BgBlackBright = 'bgBlackBright',
	BgRedBright = 'bgRedBright',
	BgGreenBright = 'bgGreenBright',
	BgYellowBright = 'bgYellowBright',
	BgBlueBright = 'bgBlueBright',
	BgMagentaBright = 'bgMagentaBright',
	BgCyanBright = 'bgCyanBright',
	BgWhiteBright = 'bgWhiteBright'
}

/** what prompt() returns if isRequired=true */
type PromptReturnTypeRequired<T extends IFieldDefinition> = Required<
	FieldDefinitionMap[T['type']]
>['value']

/** what prompt() returns if isRequired!==true */
type PromptReturnTypeOptional<
	T extends IFieldDefinition
> = FieldDefinitionMap[T['type']]['value']

const debug = Debug('@sprucelabs/cli')

export default class Terminal {
	private loader?: ora.Ora | null

	/** write a line with various effects applied */
	writeLn(message: any, effects: ITerminalEffect[] = []) {
		let write = chalk
		effects.forEach(effect => {
			write = write[effect]
		})
		console.log(effects.length > 0 ? write(message) : message)
	}

	/** write an array of lines quickly */
	writeLns(lines: any[], effects?: ITerminalEffect[]) {
		lines.forEach(line => {
			this.writeLn(line, effects)
		})
	}

	/** output an ojbect, one key per line */
	object(
		object: Record<string, any>,
		effects: ITerminalEffect[] = [ITerminalEffect.Green]
	) {
		this.bar()
		Object.keys(object).forEach(key => {
			this.writeLn(`${key}: ${JSON.stringify(object[key])}`, effects)
		})
		this.bar()
	}

	/** a section draws a box around what you are writing */
	section(options: {
		headline?: string
		lines?: string[]
		object?: Record<string, any>
		headlineEffects?: ITerminalEffect[]
		bodyEffects?: ITerminalEffect[]
		barEffects?: ITerminalEffect[]
	}) {
		const {
			headline,
			lines,
			object,
			barEffects = [],
			headlineEffects = [ITerminalEffect.Blue, ITerminalEffect.Bold],
			bodyEffects = [ITerminalEffect.Green]
		} = options

		this.writeLn('')
		this.bar(barEffects)
		this.writeLn('')

		if (headline) {
			this.headline(`🌲🤖 ${headline} 🌲🤖`, headlineEffects)
			this.writeLn('')
		}

		if (lines) {
			this.writeLns(lines, bodyEffects)
		}

		if (object) {
			this.object(object, bodyEffects)
		}

		this.writeLn('')
		this.bar(barEffects)
		this.writeLn('')
	}

	/** draw a bar (horizontal ruler) */
	bar(effects?: ITerminalEffect[]) {
		const bar = '=================================================='
		this.writeLn(bar, effects)
	}

	/** a headline */
	headline(
		message: string,
		effects: ITerminalEffect[] = [ITerminalEffect.Blue, ITerminalEffect.Bold]
	) {
		this.writeLn(message, effects)
	}

	/** when outputing something information */
	info(message: string) {
		if (typeof message !== 'string') {
			debug('Invalid info log')
			debug(message)
			return
		}

		this.writeLn(`🌲🤖 ${message}`, [ITerminalEffect.Cyan])
	}

	/** the user did something wrong, like entered a bad value */
	warn(message: string) {
		if (typeof message !== 'string') {
			debug('Invalid warn log')
			debug(message)
			return
		}

		this.writeLn(`⚠️ ${message}`, [
			ITerminalEffect.Bold,
			ITerminalEffect.Yellow
		])
	}

	/** the user did something wrong, like entered a bad value */
	error(message: string) {
		if (typeof message !== 'string') {
			debug('Invalid error log')
			debug(message)
			return
		}

		this.writeLn(`🛑 ${message}`, [ITerminalEffect.Bold, ITerminalEffect.Bold])
	}

	/** something major or a critical information but program will not die */
	crit(message: string) {
		if (typeof message !== 'string') {
			debug('Invalid crit log')
			debug(message)
			return
		}

		this.writeLn(`🛑 ${message}`, [ITerminalEffect.Red, ITerminalEffect.Bold])
	}
	/** everything is crashing! */
	fatal(message: string) {
		if (typeof message !== 'string') {
			debug('Invalid fatal log')
			debug(message)
			return
		}

		this.writeLn(`💥 ${message}`, [ITerminalEffect.Red, ITerminalEffect.Bold])
	}

	async startLoading(message?: string) {
		this.stopLoading()
		this.loader = ora({
			text: message
		}).start()
	}

	async stopLoading() {
		this.loader?.stop()
		this.loader = null
	}

	/** ask the user to confirm something */
	async confirm(question: string): Promise<boolean> {
		const confirmResult = await inquirer.prompt({
			type: 'confirm',
			name: 'answer',
			message: question
		})

		return !!confirmResult.answer
	}

	/** clear the console */
	clear() {
		console.clear()
	}

	/** ask the user for something */
	async prompt<T extends IFieldDefinition>(
		definition: T
	): Promise<
		T['isRequired'] extends true
			? PromptReturnTypeRequired<T>
			: PromptReturnTypeOptional<T>
	> {
		const name = generateInquirerFieldName()
		const fieldDefinition: IFieldDefinition = definition
		const { isRequired, defaultValue, label } = fieldDefinition

		// universal is required validator
		const validateIsRequired = (input: any): boolean => {
			if (isRequired) {
				return input?.length > 0
			}

			return true
		}

		const promptOptions: Record<string, any> = {
			default: defaultValue,
			name,
			message: label,
			validate: validateIsRequired
		}

		// @ts-ignore TODO Why does this mapping not work?
		const field: Field = new FieldClassMap[fieldDefinition.type](
			fieldDefinition
		)

		// setup transform and validate
		promptOptions.transform = field.toValueType.bind(field)
		promptOptions.validate = (value: string) => {
			return field.validate(value).length > 0
		}

		switch (field.getType()) {
			case FieldType.Select:
				promptOptions.type = 'list'
				promptOptions.choices = (field as FieldSelect)
					.getChoices()
					.map(choice => ({
						name: choice.label,
						value: choice.value
					}))

				if (!isRequired) {
					promptOptions.choices.push(new inquirer.Separator())
					promptOptions.choices.push({
						name: 'Cancel',
						value: -1
					})
				}
				break

			default:
				promptOptions.type = 'input'
		}

		// TODO update method signature to type this properly
		const response = (await inquirer.prompt(promptOptions)) as any
		return response[name]
	}

	handleError(e: Error) {
		this.stopLoading()

		this.section({
			headline: `Fatal error: ${e.message}`,
			lines: (e.stack || '').split('/n'),
			headlineEffects: [ITerminalEffect.Bold, ITerminalEffect.Red],
			barEffects: [ITerminalEffect.Red],
			bodyEffects: [ITerminalEffect.Red]
		})
	}
}

export const terminal = new Terminal()
