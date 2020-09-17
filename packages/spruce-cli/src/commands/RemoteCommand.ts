import { Command } from 'commander'
import RemoteStore, {
	RemoteStoreRemoteType,
	RemoteStoreChoices,
} from '../stores/RemoteStore'
import AbstractCommand, { ICommandOptions } from './AbstractCommand'

interface IRemoteCommandOptions extends ICommandOptions {
	stores: {
		remote: RemoteStore
	}
}

export default class RemoteCommand extends AbstractCommand {
	private remoteStore: RemoteStore
	public constructor(options: IRemoteCommandOptions) {
		super(options)
		this.remoteStore = options.stores.remote
	}
	/** Sets up commands */
	public attachCommands(program: Command) {
		program
			.command('remote.set [environment]')
			.description('Set the environment to use')
			.action(this.setEnvironment)
	}

	public setEnvironment = async (
		environmentParam?: RemoteStoreRemoteType | string
	) => {
		let environment = environmentParam

		if (!environment) {
			environment = await this.term.prompt({
				type: 'select',
				isRequired: true,
				label: 'Select a remote',
				options: {
					choices: RemoteStoreChoices,
				},
			})
		}

		// eslint-disable-next-line @typescript-eslint/no-floating-promises
		this.remoteStore.setRemote(environment as RemoteStoreRemoteType).save()
	}
}
