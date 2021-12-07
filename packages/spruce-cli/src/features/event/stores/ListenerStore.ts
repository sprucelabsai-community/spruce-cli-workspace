import { eventDiskUtil } from '@sprucelabs/spruce-event-utils'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { ListenerTemplateItem } from '@sprucelabs/spruce-templates'
import globby from 'globby'
import AbstractStore from '../../../stores/AbstractStore'

export type Listener = ListenerTemplateItem & {
	path: string
}

export default class ListenerStore extends AbstractStore {
	public name = 'listener'

	public async loadListeners() {
		const matches = await globby(
			diskUtil.resolvePath(this.cwd, 'src', 'listeners', '**/*.listener.ts')
		)

		const listeners: Listener[] = []

		for (const match of matches) {
			const listener = eventDiskUtil.splitPathToListener(match)
			listeners.push({
				...listener,
				path: match,
			})
		}

		return listeners
	}
}
