import AbstractSpruceTest, { test, assert } from '@sprucelabs/test-utils'
import { argParserUtil } from '../../utilities/argParser.utility'

export default class ArgParserTest extends AbstractSpruceTest {
    @test()
    protected static async canGetArgParser() {
        assert.isTruthy(argParserUtil)
    }

    @test('Parses empty string as empty array obj', '', {})
    @test('Parses `-d` as { d: "true" } ', '-d', { d: 'true' })
    @test('Parses `-d false` as { d: "false" }', '-d false', { d: 'false' })
    @test(
        'Parses `-d false --test true` as { d: "false":, test: "true" }',
        '-d false --test true',
        { d: 'false', test: 'true' }
    )
    protected static async parse(
        args: string,
        expected: Record<string, string>
    ) {
        const results = argParserUtil.parse(args)
        assert.isEqualDeep(results, expected)
    }
}
