import { buildSchema } from '@sprucelabs/schema'
import { heartwoodRemoteUtil } from '@sprucelabs/spruce-event-utils'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'

const optionsSchema = buildSchema({
	id: 'watchViewsOptions',
	description: 'Watch for view changes and preview them in real time.',
	fields: {},
})

type OptionsSchema = typeof optionsSchema

export default class WatchAction extends AbstractAction<OptionsSchema> {
	public commandAliases = ['watch.views']
	public optionsSchema: OptionsSchema = optionsSchema
	public invocationMessage = 'Watching views... 🤩'
	private skillName!: string

	public async execute(): Promise<FeatureActionResponse> {
		const skill = await this.Store('skill').loadCurrentSkill()
		this.skillName = skill.name

		this.resetUi()
		const commands = this.Service('command')
		await commands.execute(
			'SHOULD_WATCH_VIEWS=true MAXIMUM_LOG_PREFIXES_LENGTH=0 yarn boot',
			{
				onData: (data) => {
					const line = data
						.trim()
						.split('\n')
						.filter((s) => !!s)
						.pop()
					this.ui.startLoading(
						line && line.length > 0 ? line.trim() : 'Waiting for changes'
					)
				},
			}
		)

		return {
			summaryLines: [`Done watching...`],
		}
	}

	private getPreviewUrl() {
		const remote = this.Service('remote').getRemote() as any
		return heartwoodRemoteUtil.buildUrl(remote) + '/#views/heartwood.watch'
	}

	private resetUi() {
		this.ui.clear()
		this.ui.renderHero('Heartwood')
		this.ui.renderDivider()
		this.ui.renderLines([
			'',
			`Skill: ${this.skillName}`,
			`Preview: ${this.getPreviewUrl()}`,
			'',
		])
		this.ui.renderDivider()
		this.ui.renderLine('')
		this.ui.startLoading('Watching for changes')
	}
}
