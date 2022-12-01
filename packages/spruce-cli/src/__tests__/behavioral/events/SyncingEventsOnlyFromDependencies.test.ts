import { diskUtil, namesUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import fsUtil from 'fs-extra'
import AbstractSkillTest from '../../../tests/AbstractSkillTest'
import { RegisteredSkill } from '../../../types/cli.types'

export default class SyncingEventsOnlyFromDependenciesTest extends AbstractSkillTest {
	protected static skillCacheKey = 'events'

	@test()
	protected static async doesntSyncAnythingButListenersToStart() {
		const skills = this.getSkillFixture()
		await skills.registerCurrentSkill({
			name: 'events in sync skill',
		})
		const { skill } = await this.registerGlobalEvent()

		const results = await this.Action('event', 'sync', {}).execute({})
		assert.isFalsy(results.errors)

		const eventFolder = this.resolveEventFolder(skill)

		assert.isFalse(diskUtil.doesDirExist(eventFolder))

		const files = fsUtil.readdirSync(this.resolveHashSprucePath('events'))

		assert.isLength(files, 2, 'The wrong number of files were generated.')
		assert.isEqual(files[0], 'events.contract.ts')
		assert.isEqual(files[1], 'listeners.ts')
	}

	@test()
	protected static async syncsEventsForSkillsWeveAddedAsDependencies() {
		const { skill } = await this.registerGlobalEvent()

		this.Service('dependency').add({
			id: skill.id,
			namespace: skill.slug,
		})

		const results = await this.Action('event', 'sync', {}).execute({})
		assert.isFalsy(results.errors)

		const eventFolder = this.resolveEventFolder(skill)

		assert.isTrue(diskUtil.doesDirExist(eventFolder))

		const files = fsUtil.readdirSync(this.resolveHashSprucePath('events'))

		assert.isLength(files, 3, 'The wrong number of files were generated.')
		assert.isEqual(files[0], namesUtil.toCamel(skill.slug))
		assert.isEqual(files[1], 'events.contract.ts')
		assert.isEqual(files[2], 'listeners.ts')
	}

	private static async registerGlobalEvent() {
		const skills = this.getSkillFixture()

		const skill = await skills.seedDemoSkill({ name: 'a temp skill' })

		await skills.registerEventContract(skill, {
			eventSignatures: {
				'test-sync::v2021_01_01': {
					isGlobal: true,
				},
			},
		})

		return { skill }
	}

	private static resolveEventFolder(skill: RegisteredSkill) {
		return this.resolveHashSprucePath('events', namesUtil.toCamel(skill.slug))
	}
}
