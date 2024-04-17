export default function isCi() {
    const env = process.env

    if (
        [
            'TRAVIS',
            'CIRCLECI',
            'APPVEYOR',
            'GITLAB_CI',
            'GITHUB_ACTIONS',
            'BUILDKITE',
            'DRONE',
        ].some((sign) => sign in env) ||
        env.CI_NAME === 'codeship'
    ) {
        return true
    }

    return false
}
