import BaseSpruceError from '@sprucelabs/error'
import ErrorOptions from '#spruce/errors/options.types'

export default class SpruceError extends BaseSpruceError<ErrorOptions> {
	/** An easy to understand version of the errors */
	public friendlyMessage(): string {
		const { options } = this
		let message
		switch (options?.code) {
			case 'INVALID_COMMAND':
				message = `Invalid command: ${options.args.join(' ')}\n`
				message += `Try running spruce --help`
				break

			case 'USER_NOT_FOUND':
				message = 'Could not find a user.'
				message += ` token: "${options.token}", userId: "${options.userId}"`
				break

			case 'GENERIC':
				message = "When you're too lazy to make a new error"
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

			case 'GENERIC_MERCURY':
				message = `Error: Event "${options.eventName ?? 'n/a'}"${
					options.friendlyMessage
						? `: ${options.friendlyMessage}`
						: `: ${this.originalError?.message}`
				}`
				break

			case 'SCHEMA_FAILED_TO_IMPORT':
				message = `Error importing "${options.file}"`
				break

			case 'BUILD_FAILED':
				message = `Build${
					options.file ? `ing ${options.file}` : ''
				} failed. It looks like you're not running 'yarn watch'. Run it and then run 'spruce all:sync'.`

				break

			case 'FAILED_TO_IMPORT':
				message = `Failed to import ${options.file}`
				break

			case 'LINT_FAILED':
				message = `Lint failed on pattern ${options.pattern}. Response from lint was:\n\n`
				message += options.stdout
				break

			case 'EXECUTING_COMMAND_FAILED':
				if (this.originalError && this.originalError.message) {
					message = this.originalError.message + '\n\n'
				} else {
					message = ''
				}
				message += `The command that was being executed failed ${options.cmd}.`
				if (options.cwd) {
					message += `\n\nCWD: ${options.cwd}`
				}

				if (options.stdout) {
					message += '\n\nstdout:' + options.stdout
				}

				break

			
            case 'BUILD_FAILED':
                message = 'A BuildFailed just happened!'
                break
            case 'COMMAND_NOT_IMPLEMENTED':
                message = 'A Command not implemented just happened!'
                break
            case 'CREATE_AUTOLOADER_FAILED':
                message = 'A Could not create an autoloader just happened!'
                break
            case 'DIRECTORY_EMPTY':
                message = 'A directory empty just happened!'
                break
            case 'EXECUTING_COMMAND_FAILED':
                message = 'A Executing command failed just happened!'
                break
            case 'FAILED_TO_IMPORT':
                message = 'A FailedToImport just happened!'
                break
            case 'FILE_EXISTS':
                message = 'A fileExists just happened!'
                break
            case 'PAYLOAD_ARGS':
                message = 'A Payload args just happened!'
                break
            case 'GENERIC_MERCURY':
                message = 'A Generic mercury just happened!'
                break
            case 'GENERIC':
                message = 'A generic just happened!'
                break
            case 'INVALID_COMMAND':
                message = 'A Invalid command just happened!'
                break
            case 'LINT_FAILED':
                message = 'A Lint failed! just happened!'
                break
            case 'NOT_IMPLEMENTED':
                message = 'A Not implemented just happened!'
                break
            case 'SCHEMA_FAILED_TO_IMPORT':
                message = 'A Definition failed to import just happened!'
                break
            case 'USER_NOT_FOUND':
                message = 'A User not found just happened!'
                break

default:
				message = super.friendlyMessage()
		}

		// Drop on code and friendly message
		message = `${options.code}: ${message}`
		const fullMessage = `${message}${
			options.friendlyMessage ? `\n\n${options.friendlyMessage}` : ''
		}`

		// Handle repeating text from original message by remove it
		return `${fullMessage}${
			this.originalError &&
			this.originalError.message &&
			this.originalError.message !== fullMessage
				? `\n\nOriginal error: ${this.originalError.message.replace(
						message,
						''
				  )}`
				: ''
		}`
	}
}
