import AbstractSpruceError from '@sprucelabs/error'
import { ErrorCode } from '../.spruce/errors/codes.types'
import { ErrorOptions } from '../.spruce/errors/options.types'

export default class SpruceError extends AbstractSpruceError<ErrorOptions> {
	/** an easy to understand version of the errors */
	public friendlyMessage(): string {
		const { options } = this
		let message
		switch (options?.code) {
			// invalid command
			case ErrorCode.InvalidCommand:
				message = `Invalid command: ${options.args.join(' ')}\n`
				message += `Try running spruce --help`
				break
			case ErrorCode.CouldNotLoadCommand:
				message = `Failed to load command at ${options.file}!\n`
				message += 'This is likely a syntax or lint error.'
				break

			case ErrorCode.UserNotFound:
				message = 'Could not find a user.'
				message += `token: "${options.token}", userId: "${options.userId}"`
				break

			case ErrorCode.Generic:
				message = "When you're too lazy to make a new error"
				break

			case ErrorCode.NotImplemented:
				message = 'This command has not yet been implemented '
				break

			case ErrorCode.GenericMercury:
				message = `Not sure what happened: Event ${options.eventName}`
				break
			case ErrorCode.TranspileFailed:
				message = 'Could not transpile (ts -> js) a script'

				break

			case ErrorCode.DefinitionFailedToImport:
				message = `The definition at ${options.file} failed to import: ${options.details}`

				break

			default:
				message = super.friendlyMessage()
		}

		return message
	}
}
