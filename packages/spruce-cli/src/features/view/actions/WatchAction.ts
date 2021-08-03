import { buildSchema, SchemaValues } from '@sprucelabs/schema'
import { heartwoodRemoteUtil } from '@sprucelabs/spruce-event-utils'
import { GraphicsTextEffect } from '@sprucelabs/spruce-skill-utils'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'
import { BootMeta } from '../../skill/actions/BootAction'
import WatchFeature from '../../watch/WatchFeature'

const optionsSchema = buildSchema({
	id: 'watchViewsOptions',
	description: 'Watch for view changes and preview them in real time.',
	fields: {
		shouldReturnImmediately: {
			type: 'boolean',
			hint: "For testing so we don't wait until the process is killed to get the results.",
		},
	},
})

type OptionsSchema = typeof optionsSchema
type Options = SchemaValues<OptionsSchema>

export default class WatchAction extends AbstractAction<OptionsSchema> {
	public commandAliases = ['watch.views']
	public optionsSchema: OptionsSchema = optionsSchema
	public invocationMessage = 'Watching views... 🤩'
	private resolve?: () => void
	private bootControls?: BootMeta
	private skillName!: string
	private bootMessage!: string
	private watchFeature!: WatchFeature

	public async execute(options?: Options): Promise<FeatureActionResponse> {
		const { shouldReturnImmediately } = this.validateAndNormalizeOptions(
			options ?? {}
		)

		this.watchFeature = this.featureInstaller.getFeature('watch')
		await this.watchFeature.startWatching({ delay: 2000 })

		const skill = await this.Store('skill').loadCurrentSkill()

		this.skillName = skill.name
		this.bootControls = await this.boot()

		await this.emitter.on('watcher.did-detect-change', async () => {
			this.bootControls?.kill()
			this.bootControls = await this.boot(
				'Changes detected, rebooting skill...'
			)
		})

		if (!shouldReturnImmediately) {
			await new Promise((resolve) => {
				//@ts-ignore
				this.resolve = resolve
			})

			await this.watchFeature.stopWatching()
			this.bootControls?.kill()
		}

		return {
			summaryLines: [`Done watching...`],
			meta: {
				bootPromise: this.bootControls.bootPromise,
			},
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

	public async kill() {
		await this.watchFeature.stopWatching()
		this.bootControls?.kill()
		this.resolve?.()
	}

	public getPid() {
		return this.bootControls?.pid
	}
}
