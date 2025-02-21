import { fake } from '@sprucelabs/spruce-test-fixtures'
import AbstractSpruceTest, {
    test,
    assert,
    errorAssert,
} from '@sprucelabs/test-utils'

@fake.login()
export default class StaticTestFinderTest extends AbstractSpruceTest {
    @test()
    protected static async throwsWithMissing() {
        const finder = StaticTestFinder.Finder()
        const err = await assert.doesThrowAsync(() => finder.find())
        errorAssert.assertError(err, 'MISSING_PARAMETERS', {
            parameters: ['lookupDir'],
        })
    }

    @test()
    protected static async yourNextTest() {
        assert.isTrue(false)
    }
}

class StaticTestFinder {
    public static Finder() {
        return new this()
    }

    public async find() {
        // assertOptions({}, ['lookupDir'])
    }
}
