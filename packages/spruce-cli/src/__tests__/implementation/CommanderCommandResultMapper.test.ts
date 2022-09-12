import { buildSchema } from '@sprucelabs/schema'
import AbstractSpruceTest, { test, assert } from '@sprucelabs/test-utils'
import { Command } from 'commander'
import commanderUtil from '../../utilities/commander.utility'

export default class CommanderCommandResultMapperTest extends AbstractSpruceTest {
	private static readonly optionsSchema = buildSchema({
		id: 'optionsSchema',
		fields: { name: { type: 'text' }, email: { type: 'text' } },
	})

	@test()
	protected static async utilExists() {
		assert.isTruthy(commanderUtil)
	}

	@test()
	protected static async canTakeOptionsAndPassThemBack() {
		const results = commanderUtil.mapIncomingToOptions({})
		assert.isEqualDeep(results, {})
	}

	@test()
	protected static async handlesNoArgs() {
		const results = commanderUtil.mapIncomingToOptions()
		assert.isEqualDeep(results, {})
	}

	@test()
	protected static async dropCommanderInstanceFromResults() {
		const results = commanderUtil.mapIncomingToOptions({}, new Command())
		assert.isEqualDeep(results, {})
	}

	@test()
	protected static async handlesUndefinedSchema() {
		const results = commanderUtil.mapIncomingToOptions(
			{},
			new Command(),
			undefined
		)
		assert.isEqualDeep(results, {})
	}

	@test()
	protected static async handlesSchemBeingAtTheEnd() {
		const results = commanderUtil.mapIncomingToOptions(
			{},
			new Command(),
			this.optionsSchema
		)
		assert.isEqualDeep(results, {})
	}

	@test()
	protected static async fristStringArgGetsDroppedIntoFirstField() {
		const results = commanderUtil.mapIncomingToOptions(
			'my great skill',
			{},
			new Command(),
			this.optionsSchema
		)
		assert.isEqualDeep(results, {
			name: 'my great skill',
		})
	}

	@test()
	protected static async mixesInFirstArgWithPassedArgs() {
		const results = commanderUtil.mapIncomingToOptions(
			'my great skill',
			{
				email: 't@t.com',
			},
			new Command(),
			this.optionsSchema
		)
		assert.isEqualDeep(results, {
			name: 'my great skill',
			email: 't@t.com',
		})
	}

	@test()
	protected static async mixesInTwoArgWithPassedArgs() {
		const results = commanderUtil.mapIncomingToOptions(
			'my great skill',
			't@t.com',
			{},
			new Command(),
			this.optionsSchema
		)
		assert.isEqualDeep(results, {
			name: 'my great skill',
			email: 't@t.com',
		})
	}

	@test()
	protected static stringArgsOverrideDefaults() {
		const results = commanderUtil.mapIncomingToOptions(
			'my great skill',
			't@t.com',
			{
				name: 'test',
				email: 'test',
			},
			new Command(),
			this.optionsSchema
		)
		assert.isEqualDeep(results, {
			name: 'my great skill',
			email: 't@t.com',
		})
	}
}
