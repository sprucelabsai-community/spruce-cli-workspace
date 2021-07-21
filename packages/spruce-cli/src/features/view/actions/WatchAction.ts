import { buildSchema } from '@sprucelabs/schema'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'
import { BootMeta } from '../../skill/actions/BootAction'
import { heartwoodRemoteUtil } from '../utilities/heartwoodRemote.utility'

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
	private resolve?: () => void
	private bootControls?: BootMeta

	public async execute(): Promise<FeatureActionResponse> {
		const watchFeature = this.featureInstaller.getFeature('watch')
		await watchFeature.startWatching()

		const skill = await this.Store('skill').loadCurrentSkill()

		this.ui.renderLines([
			`Skill: ${skill.name}`,
			`Preview: ${this.getPreviewUrl()}`,
			'',
		])
		this.ui.startLoading(`Booting skill.`)

		this.bootControls = await this.boot()

		this.ui.startLoading(`Waiting for view changes.`)

		await this.emitter.on('watcher.did-detect-change', async () => {
			this.ui.startLoading('Changes detected, rebooting skill...')
			this.bootControls?.kill()
			this.bootControls = await this.boot()
			this.ui.startLoading('Waiting for view changes...')
		})

		await new Promise((resolve) => {
			//@ts-ignore
			this.resolve = resolve
		})

		await watchFeature.stopWatching()
		this.bootControls?.kill()

		return {
			summaryLines: [`Done watching...`],
		}
	}
	private getPreviewUrl() {
		const remote = this.Service('remote').getRemote()
		return (
			heartwoodRemoteUtil.buildViewWatchUrl(remote) + '/#views/heartwood.watch'
		)
	}

	private async boot() {
		const results = await this.Action('skill', 'boot').execute({})

		if (results.errors) {
			throw results.errors[0]
		}

		return results.meta as BootMeta
	}

	public kill() {
		this.resolve?.()
	}

	public getPid() {
		return this.bootControls?.pid
	}
}
