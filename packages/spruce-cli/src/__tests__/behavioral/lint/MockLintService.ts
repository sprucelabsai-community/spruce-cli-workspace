import { assert } from '@sprucelabs/test-utils'

export default class MockLintService {
    private static patterns: string[] = []
    public async fix(pattern: string) {
        MockLintService.patterns.push(pattern)
        return
    }

    public static assertPatterns(patterns: string[]) {
        assert.isEqualDeep(this.patterns, patterns, `Patterns did not match`)
    }
}
