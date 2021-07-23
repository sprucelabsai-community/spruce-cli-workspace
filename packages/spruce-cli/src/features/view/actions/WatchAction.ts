import { buildSchema } from '@sprucelabs/schema'
import { heartwoodRemoteUtil } from '@sprucelabs/spruce-event-utils'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'
import { BootMeta } from '../../skill/actions/BootAction'

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

		await watchFeature.startWatching({ delay: 2000 })

		const skill = await this.Store('skill').loadCurrentSkill()

		this.ui.renderLines([
			`Skill: ${skill.name}`,
			`Preview: ${this.getPreviewUrl()}`,
			'',
		])

		this.bootControls = await this.boot()

		await this.emitter.on('watcher.did-detect-change', async () => {
			this.bootControls?.kill()
			this.bootControls = await this.boot(
				'Changes detected, rebooting skill...'
			)
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
		return heartwoodRemoteUtil.buildUrl(remote) + '/#views/heartwood.watch'
	}

	private async boot(bootMessage = 'Booting skill...') {
		this.ui.startLoading(bootMessage)
		const results = await this.Action('skill', 'boot').execute({
			shouldReturnImmediately: true,
		})

		results.meta?.bootPromise?.then(() =>
			this.ui.startLoading('Skill booted. Waiting for changes...')
		)

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
