import { SpruceError } from '@sprucelabs/schema'
import { Remote, REMOTES } from '../../event/constants'

export const HEARTWOOD_REMOTES: Record<Remote, string> = {
	local: 'http://localhost:6006',
	dev: 'https://dev.spruce.bot',
	sandbox: 'https://sandbox.spruce.bot',
	prod: 'https://spruce.bot',
}
export const heartwoodRemoteUtil = {
	buildViewWatchUrl(remote: Remote) {
		if (HEARTWOOD_REMOTES[remote]) {
			return HEARTWOOD_REMOTES[remote]
		}
		throw new SpruceError({
			code: 'INVALID_PARAMETERS',
			friendlyMessage: `\`${remote}\` is not a valid Remote. Valid options are:\n\n${Object.keys(
				REMOTES
			).join('\n')}`,
			parameters: ['remote'],
		})
	},
}
