import { EnvService } from '@sprucelabs/spruce-skill-utils'
import { Remote, REMOTES } from '../constants'

export default class RemoteService {
	private env: EnvService

	public constructor(env: EnvService) {
		this.env = env
	}

	public set(remote: Remote) {
		const host = REMOTES[remote]
		this.env.set('HOST', host)
	}

	public getHost() {
		return this.env.get('HOST')
	}

	public getRemote() {
		// move to constants or some better mapping?
		const values = Object.entries(REMOTES)
		const host = this.getHost()
		const match = values.find((v) => v[1] === host)
		return match?.[0] as Remote
	}
}
