import AbstractSpruceError from '@sprucelabs/error'
import { namesUtil } from '@sprucelabs/spruce-skill-utils'
import upperFirst from 'lodash/upperFirst'
import ErrorOptions from '#spruce/errors/options.types'

export default class SpruceError extends AbstractSpruceError<ErrorOptions> {
	/** An easy to understand version of the errors */
	public friendlyMessage(): string {
		const { options } = this
		let message

		switch (options?.code) {
			case 'INVALID_COMMAND':
				if (!options.args || options.args.length === 0) {
					message = `Hey friend 👋.. I don't support the command you tried.`
				} else {
					message = `Hey friend 👋. I don't know the command: ${options.args.join(
						' '
					)}.`
				}
				message += ' Try running `spruce --help`'
				break

			case 'GENERIC':
				message = options.friendlyMessage ?? 'Oh shoot! 🤔'

				if (options.originalError) {
					message += `\n\n${
						options.originalError.stack ?? options.originalError.name
					}`
				}
				break
			case 'NOT_IMPLEMENTED':
				message = ''
				if (options.friendlyMessage) {
					message += `\n\n${options.friendlyMessage}`
				}
				break
			case 'COMMAND_NOT_IMPLEMENTED':
				message = `${options.command} has not yet been implemented. ${
					options.args ? `Args: ${options.args.join(', ')}` : ''
				}`
				if (options.friendlyMessage) {
					message += `\n\n${options.friendlyMessage}`
				}

				break

			case 'SCHEMA_FAILED_TO_IMPORT':
				message = `Error importing "${options.file}". Original error:\n\n${
					options.originalError?.message ?? '**MISSING**'
				}`
				break

			case 'BUILD_FAILED':
				message = `Build${
					options.file ? `ing ${options.file}` : ''
				} failed. It looks like you're not running 'yarn watch'. Run it and then run 'spruce all:sync'.`

				break

			case 'FAILED_TO_IMPORT':
				message =
					options.friendlyMessage ??
					`Failed to import "${options.file}". Original error:\n\n${
						options.originalError?.message ?? '**MISSING**'
					}`
				break

			case 'LINT_FAILED':
				message = options.friendlyMessage

				if (!message) {
					message = `Lint failed on pattern ${options.pattern}.`

					if (options.originalError) {
						message += `\n\nOriginal error:${
							options.originalError.stack ?? options.originalError.message
						}`
					}
				}

				break

			case 'EXECUTING_COMMAND_FAILED':
				if (this.originalError && this.originalError.message) {
					message = this.originalError.message + '\n\n'
				} else {
					message = ''
				}
				message += `Executing command failed '${options.cmd}'.\n\n`
				if (options.cwd) {
					message += `cwd: ${options.cwd}\n\n`
				}

				if (options.stderr) {
					message += this.cleanStdErr(options.stderr) + '\n\n'
				}

				if (options.stdout) {
					message += options.stdout
				}

				break

			case 'CREATE_AUTOLOADER_FAILED':
				message = 'A Could not create an autoloader just happened!'
				break

			case 'DIRECTORY_EMPTY':
				message = 'A directory empty just happened!'
				break

			case 'FILE_EXISTS':
				message = 'A fail already exists.'
				break

			case 'VSCODE_NOT_INSTALLED':
				message =
					"vscode's 'code' is not installed.\n\nMac instructions: https://code.visualstudio.com/docs/setup/mac\n\nLinux instructions: https://code.visualstudio.com/docs/setup/linux\n\nWindows instructions: https://code.visualstudio.com/docs/setup/windows"
				break

			case 'SCHEMA_EXISTS':
				message = `A schema called ${options.schemaId} already exists at ${options.destination}`
				break

			case 'COMMAND_ABORTED':
				message = 'Aborted! See ya later! ✌️'
				break

			case 'INVALID_FEATURE_CODE':
				message = `Oh no! I couldn't find a feature with the code '${options.featureCode}'.`
				break

			case 'TEST_FAILED':
				message = `${options.fileName}\n - ${
					options.testName
				}\n\n${options.errorMessage
					.split('\n')
					.map((line) => `     ${line}`)
					.join('\n')}`

				break

			case 'FEATURE_NOT_INSTALLED':
				message = `\`${upperFirst(
					options.featureCode
				)}\` feature is not installed. Install it first, then try again.`
				break

			case 'MERCURY_RESPONSE_ERROR': {
				const errors = options.responseErrors
				message = `Got ${
					errors.length === 1 ? 'an error' : `${errors.length} errors`
				} from the server:\n\n`

				const errorMessages: string[] = []
				for (const err of errors) {
					errorMessages.push(err.message)
				}

				message += errorMessages.join('\n')

				break
			}
			case 'INVALID_TEST_DIRECTORY':
				message = `You are missing dependencies I need to run tests. Try \`spruce test.install\` to reinstall.`
				break

			case 'DIRECTORY_NOT_SKILL':
				message = 'The directory you are in is not a skill!'
				break

			case 'SKILL_NOT_REGISTERED':
				message = `Dang! I can't continue until you register your skill! Run \`spruce login\` and then \`spruce register.skill\` to get the ball rolling!`
				break

			case 'NO_ORGANIZATIONS_FOUND':
				message =
					"It looks like you don't have any organizations setup yet. Try `spruce create.organization` first."
				break

			case 'INVALID_EVENT_CONTRACT':
				message = `The event named \`${options.fullyQualifiedEventName}\` is not valid. Check ${options.brokenProperty}. The original error is:\n\n${options.originalError?.message}`
				break

			case 'BOOT_ERROR':
				message = `Booting your skill failed: ${
					options.friendlyMessage ??
					options.originalError?.message ??
					'Not sure why, tho.'
				}`
				break

			case 'DEPLOY_FAILED':
				message = 'Deploy halted!'
				break

			case 'MISSING_DEPENDENCIES':
				message = `Looks like you're missing some dependencies:\n\n${options.dependencies
					.map((d) => `${d.name}: ${d.hint}`)
					.join('\n')}`
				break

			case 'STORE_EXISTS':
				message = 'A Store exists just happened!'
				break

			case 'NOT_LOGGED_IN':
				message = 'You have to be logged in to do that!'
				break

			case 'SKILL_NOT_FOUND':
				message = options.friendlyMessage ?? `I couldn't find that skill!`
				break

			case 'NO_SKILLS_REGISTERED':
				message = `Whoa! Looks like you haven't registered your skill yet! Try \`spruce register\` to get that done!`
				break

			case 'COMMAND_BLOCKED':
				message = `${options.command} is blocked! ${options.hint}`
				break

			case 'SKILL_VIEW_EXISTS':
				message = `A skill view controller already exists named ${options.name}!`
				break

			case 'THEME_EXISTS':
				message = `Yikes! You can't create a new theme. One per skill for now.`
				break

			case 'CACHE_NOT_ENABLED':
				message = "Cache is not enabled, so it can't be disabled!"
				break

			case 'DOCKER_NOT_STARTED':
				message = 'Docker has not been started! Start it and try again!'
				break

			case 'SCHEMA_TEMPLATE_ITEM_BUILDING_FAILED':
				message = `Failed to build schema template item for '${namesUtil.toPascal(
					options.schemaNamespace
				)}.${options.schemaId}'. The field I had an issue on was '${
					options.fieldName
				}'. It's options are:\n\n${JSON.stringify(
					options.fieldOptions
				)}.\n\nChances are you have a circular reference in your schemas. You'll need to extract shared fields to a new file and have your schemas mix those in, vs referencing eath other.`
				break

			case 'ACTION_CANCELLED':
				message = 'A Action cancelled just happened!'
				break

			case 'TRANSPORT_ALREADY_EXISTS':
				message = `A transport named '${options.name}' already exists!`
				break

			case 'DEPENDENCY_EXISTS':
				message = `You already have ${options.namespace} as a dependency!`
				break

			case 'VIEW_PLUGIN_ALREADY_EXISTS':
				message = `A view plugin by the name ${options.name} already exists!`
				break

			default:
				message = super.friendlyMessage()
		}

		return message
	}

	private cleanStdErr(stderr: string) {
		return stderr.replace('warning package.json: No license field', '').trim()
	}
}
