import { buildSchema } from '@sprucelabs/schema'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import AbstractAction from '../../AbstractAction'
import ListenerTemplateItemBuilder from '../builders/ListenerTemplateItemBuilder'

const syncListenersOptionScheam = buildSchema({
	id: 'syncListenersOptions',
	fields: {},
})

type OptionsSchema = typeof syncListenersOptionScheam

export default class SyncListenerAction extends AbstractAction<OptionsSchema> {
	public optionsSchema: OptionsSchema = syncListenersOptionScheam
	public invocationMessage = 'Syncing listeners... 🎧'
	public commandAliases = ['sync.listeners']

	public async execute() {
		const listeners = await this.Store('listener').loadListeners()
		const builder = new ListenerTemplateItemBuilder()

		const templateItems = builder.buildTemplateItems({
			listeners,
			cwd: this.cwd,
		})

		const files = await this.Writer('event').writeListenerMap(
			diskUtil.resolveHashSprucePath(this.cwd, 'events'),
			{
				listeners: templateItems,
			}
		)

		return {
			files,
		}
	}
}
