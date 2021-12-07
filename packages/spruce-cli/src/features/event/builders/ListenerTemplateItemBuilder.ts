import pathUtil from 'path'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { ListenerTemplateItem } from '@sprucelabs/spruce-templates'
import { Listener } from '../stores/ListenerStore'

export default class ListenerTemplateItemBuilder {
	public buildTemplateItems(options: { listeners: Listener[]; cwd: string }) {
		const destination = diskUtil.resolveHashSprucePath(
			options.cwd,
			'events',
			'listeners.ts'
		)

		const listeners: ListenerTemplateItem[] = []

		for (const match of options.listeners) {
			listeners.push({
				...match,
				path: pathUtil
					.relative(pathUtil.dirname(destination), match.path)
					.replace('.ts', ''),
			})
		}

		return listeners
	}
}
