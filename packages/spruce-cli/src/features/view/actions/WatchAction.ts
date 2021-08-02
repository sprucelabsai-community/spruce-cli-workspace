import { buildSchema } from '@sprucelabs/schema'
import { heartwoodRemoteUtil } from '@sprucelabs/spruce-event-utils'
import { GraphicsTextEffect } from '@sprucelabs/spruce-skill-utils'
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
	private skillName!: string
	private bootMessage!: string

	public async execute(): Promise<FeatureActionResponse> {
		const watchFeature = this.featureInstaller.getFeature('watch')

		await watchFeature.startWatching({ delay: 2000 })

		const skill = await this.Store('skill').loadCurrentSkill()

		this.skillName = skill.name
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
		const remote = this.Service('remote').getRemote() as any
		return heartwoodRemoteUtil.buildUrl(remote) + '/#views/heartwood.watch'
	}

	private async boot(bootMessage = 'Booting skill...') {
		this.bootMessage = bootMessage
		this.resetUi()

		const results = await this.Action('skill', 'boot').execute({
			shouldReturnImmediately: true,
			onData: (msg: string) => {
				if (!msg.includes('node build/index') && !msg.includes('yarn run')) {
					this.ui.stopLoading()
					this.ui.renderLine(msg.trim())
					this.ui.startLoading(this.bootMessage)
				}
			},
			onError: (msg: string) => {
				if (!msg.includes('No license field')) {
					this.ui.stopLoading()
					this.ui.renderLine(msg, [GraphicsTextEffect.Red])
					this.ui.startLoading()
				}
			},
		})

		results.meta?.bootPromise?.then(() => {
			this.bootMessage = 'Skill booted. Waiting for changes...'
			this.ui.startLoading(this.bootMessage)
		})

		if (results.errors) {
			throw results.errors[0]
		}

		return results.meta as BootMeta
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
		this.ui.startLoading(this.bootMessage)
	}

	public kill() {
		this.bootControls?.kill()
		this.resolve?.()
	}

	public getPid() {
		return this.bootControls?.pid
	}
}
