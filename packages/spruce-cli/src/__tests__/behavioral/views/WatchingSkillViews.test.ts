import { test, assert } from '@sprucelabs/test-utils'
import WatchAction from '../../../features/view/actions/WatchAction'
import CommandService from '../../../services/CommandService'
import AbstractSkillTest from '../../../tests/AbstractSkillTest'

export default class WatchingSkillViewsTest extends AbstractSkillTest {
	protected static skillCacheKey = 'views'
	protected static oldBootExecute: any
	private static action: WatchAction

	protected static async beforeEach() {
		await super.beforeEach()
		this.action = this.Action('view', 'watch')
	}

	@test()
	protected static async hasWatchSkillViewsEvent() {
		assert.isFunction(this.action.execute)
	}

	@test()
	protected static async shouldCallBoot() {
		let wasHit = false
		CommandService.fakeCommand(
			'ENABLED_SKILL_FEATURES=view,event SHOULD_WATCH_VIEWS=true MAXIMUM_LOG_PREFIXES_LENGTH=0 yarn boot',
			{
				code: 200,
				callback: () => {
					wasHit = true
				},
			}
		)

		void this.action.execute()

		await this.wait(10)

		assert.isTrue(wasHit)
	}
}
