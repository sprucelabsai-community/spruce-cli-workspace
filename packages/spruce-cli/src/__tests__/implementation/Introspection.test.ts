import { test, assert } from '@sprucelabs/test-utils'
import AbstractCliTest from '../../tests/AbstractCliTest'
import introspectionUtil from '../../utilities/introspection.utility'

export default class IntrospectionTest extends AbstractCliTest {
	@test()
	protected static doesntCrashWithBadFiles() {
		const path = this.resolveTestPath('introspection/BadDefinition.ts')
		const results = introspectionUtil.introspect([path])
		assert.isEqualDeep(results, [{ classes: [], interfaces: [] }])
	}

	@test()
	protected static canIntrospectClassThatHasNoParentButImplementsInterface() {
		const path = this.resolveTestPath('introspection/ImplementsInterface.ts')
		const results = introspectionUtil.introspect([path])

		const classPath = this.resolveTestPath(
			'introspection/ImplementsInterface.ts'
		)
		assert.isEqualDeep(results, [
			{
				classes: [
					{
						classPath,
						className: 'ImplementsInterface',
						isAbstract: false,
						optionsInterfaceName: undefined,
						parentClassName: undefined,
						parentClassPath: undefined,
						staticProperties: {
							name: 'test',
						},
					},
				],
				interfaces: [{ interfaceName: 'TestInterface' }],
			},
		])
	}
}
