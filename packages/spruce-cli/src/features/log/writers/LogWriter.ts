import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import SpruceError from '../../../errors/SpruceError'
import AbstractWriter from '../../../writers/AbstractWriter'

export default class LogWriter extends AbstractWriter {
	public async writeTransportPlugin(
		cwd: string,
		options: { nameCamel: string; nameReadable: string }
	) {
		const { nameCamel, nameReadable } = options

		const name = `${nameCamel}Transport.plugin.ts`
		const destination = diskUtil.resolvePath(cwd, 'src', 'logTransports', name)

		if (diskUtil.doesFileExist(destination)) {
			throw new SpruceError({
				code: 'TRANSPORT_ALREADY_EXISTS',
				name: nameReadable,
			})
		}

		const contents = this.templates.logTransport()

		const files = await this.writeFileIfChangedMixinResults(
			destination,
			contents,
			'Your new log transport hot off the press!'
		)

		return files[0]
	}
}
