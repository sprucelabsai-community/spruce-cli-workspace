import { test, assert } from '@sprucelabs/test'
import ps from 'ps-node'
import WatchAction from '../../features/view/actions/WatchAction'
import CommandService from '../../services/CommandService'
import AbstractCliTest from '../../tests/AbstractCliTest'

export default class WatchingSkillViewsTest extends AbstractCliTest {
	protected static async beforeEach() {
		await super.beforeEach()
		this.getFeatureInstaller().isInstalled = async () => true
	}

	@test()
	protected static async hasWatchSkillViewsEvent() {
		assert.isFunction(this.Action('view', 'watch').execute)
	}

	@test()
	protected static async shouldCallBoot() {
		let wasHit = false
		CommandService.setMockResponse(/yarn boot/gis, {
			code: 0,
			callback: () => {
				wasHit = true
			},
		})

		void this.Action('view', 'watch').execute({})
		await this.wait(10)
		assert.isTrue(wasHit)
	}

	@test()
	protected static async shouldCallBootAgainOnFileChange() {
		let hitCount = 0
		CommandService.setMockResponse(/yarn boot/gis, {
			code: 0,
			callback: () => {
				hitCount++
			},
		})

		void this.Action('view', 'watch').execute({})
		await this.wait(10)

		assert.isEqual(hitCount, 1)

		const emitter = this.getEmitter()

		await emitter.emit('watcher.did-detect-change', {
			changes: [
				{
					schemaId: 'generatedFile',
					version: 'v2020_07_22',
					values: {
						action: 'updated',
						name: 'Cool name!',
						path: '/',
					},
				},
			],
		})

		assert.isEqual(hitCount, 2)
	}

	@test()
	protected static async holdsOnAction() {
		CommandService.setMockResponse(/yarn boot/gis, {
			code: 0,
		})

		const watchAction = this.Action('view', 'watch') as WatchAction
		const actionPromise = watchAction.execute()
		let didWait = false
		const waitPromise = new Promise((resolve) => {
			setTimeout(() => {
				didWait = true
				watchAction.kill()
				resolve(null)
			}, 1000)
		})

		await actionPromise
		await waitPromise

		assert.isTrue(didWait)
	}

	@test()
	protected static async canKillAction() {
		CommandService.setMockResponse(/yarn boot/gis, {
			code: 0,
		})

		const watchAction = this.Action('view', 'watch') as WatchAction
		const actionPromise = watchAction.execute()

		let didWait = false
		const waitPromise = new Promise((resolve) => {
			setTimeout(() => {
				didWait = true
				resolve(null)
			}, 1000)
		})

		await this.wait(100)

		//@ts-ignore
		watchAction.kill()

		await actionPromise

		assert.isFalse(didWait)

		await waitPromise
	}

	@test()
	protected static async makeSureWatcherIsStartedAndStopped() {
		CommandService.setMockResponse(/yarn boot/gis, {
			code: 0,
		})

		const watchFeature = this.getFeatureInstaller().getFeature('watch')
		let wasStarted = false
		let wasStopped = false

		watchFeature.startWatching = async () => {
			wasStarted = true
		}

		watchFeature.stopWatching = async () => {
			wasStopped = true
		}

		const watchAction = this.Action('view', 'watch') as WatchAction
		void watchAction.execute()

		await this.wait(100)

		assert.isTrue(wasStarted)
		assert.isFalse(wasStopped)

		await watchAction.kill()
		await this.wait(100)

		assert.isTrue(wasStarted)
		assert.isTrue(wasStopped)
	}

	@test()
	protected static async killingActionKillsProcess() {
		await this.FeatureFixture().installCachedFeatures('events')
		await this.Service('build').build()

		const watchAction = this.Action('view', 'watch') as WatchAction
		void watchAction.execute()

		let pid = watchAction.getPid()

		while (!pid) {
			await this.wait(100)
			pid = watchAction.getPid()
		}

		await this.assertProcessRunning(pid)

		watchAction.kill()

		await this.wait(500)

		await assert.doesThrowAsync(() => this.assertProcessRunning(pid as number))
	}

	private static async assertProcessRunning(pid: number) {
		await new Promise((resolve, reject) => {
			ps.lookup({ pid }, (err: any, results: any) => {
				if (err || results.length !== 1) {
					reject('boot process not running')
				}

				resolve(results)
			})
		})
	}
}
