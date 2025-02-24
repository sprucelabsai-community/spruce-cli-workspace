import { namesUtil } from '@sprucelabs/spruce-skill-utils'

export function generateExpectedInstanceTestContents(name: string) {
    const pascal = namesUtil.toPascal(name)
    const camel = namesUtil.toCamel(name)

    return `import { fake } from '@sprucelabs/spruce-test-fixtures'
import AbstractSpruceTest, { test, suite, assert } from '@sprucelabs/test-utils'

@fake.login()
@suite()
export default class ${pascal}Test extends AbstractSpruceTest {
	@test()
	protected async canCreate${pascal}() {
		const ${camel} = new ${pascal}()
		assert.isTruthy(${camel})
	}

	@test()
	protected async yourNextTest() {
		assert.isTrue(false)
	}
}

class ${pascal} {}`
}

export function generateExpectedStaticTestContents(name: string) {
    const pascal = namesUtil.toPascal(name)
    const camel = namesUtil.toCamel(name)

    return `import { fake } from '@sprucelabs/spruce-test-fixtures'
import AbstractSpruceTest, { test, assert } from '@sprucelabs/test-utils'

@fake.login()
export default class ${pascal}Test extends AbstractSpruceTest {
	@test()
	protected static async canCreate${pascal}() {
		const ${camel} = new ${pascal}()
		assert.isTruthy(${camel})
	}

	@test()
	protected static async yourNextTest() {
		assert.isTrue(false)
	}
}

class ${pascal} {}`
}
