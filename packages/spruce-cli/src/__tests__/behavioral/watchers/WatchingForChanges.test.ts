import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import WatchFeature from '../../../features/watch/WatchFeature'
import AbstractCliTest from '../../../tests/AbstractCliTest'
import { GeneratedFileOrDir } from '../../../types/cli.types'

export default class WatchingForChangesTest extends AbstractCliTest {
    protected static async beforeEach(): Promise<void> {
        await super.beforeEach()
        diskUtil.createDir(this.resolvePath('dist'))
        diskUtil.createDir(this.resolvePath('build'))
    }

    @test()
    protected static async installsWatchers() {
        await this.installWatch()
        await this.assertIsFeatureInstalled('watch')
    }

    @test()
    protected static async notWatchingAtTheStart() {
        const cli = await this.installWatch()
        const isWatching = await cli.getFeature('watch').isWatching()
        assert.isFalse(isWatching)
    }

    @test()
    protected static async canStartAndStopWatch() {
        const cli = await this.installWatch()
        const feature = cli.getFeature('watch')

        void feature.startWatching()

        let isWatching = await feature.isWatching()
        assert.isTrue(isWatching)

        await feature.stopWatching()

        isWatching = await feature.isWatching()
        assert.isFalse(isWatching)
    }

    @test('does not watch src', 'src', false)
    @test('does watch build', 'build', true)
    @test('does watch dist', 'dist', true)
    protected static async watchesInCorrectDir(
        path: string,
        shouldFire: boolean
    ) {
        const cli = await this.installWatch()

        const feature = cli.getFeature('watch')

        let fireCount = 0

        void cli.on('watcher.did-detect-change', () => {
            fireCount++
        })

        await this.startWatching(feature)

        diskUtil.writeFile(
            this.resolvePath(path, 'test.ts'),
            'console.log("hello world")'
        )

        await this.stopWatching(feature)

        assert.isEqual(fireCount, shouldFire ? 1 : 0)
    }

    @test('fires once with one change', 1)
    @test('fires once with two changes', 2)
    @test('fires once with three changes', 3)
    protected static async watcherFiresEventWhenASrcFileChanges(
        changeCount: number
    ) {
        let fireCount = 0

        const cli = await this.installWatch()
        const feature = cli.getFeature('watch')
        let payloadChanges: any = {}

        void cli.on('watcher.did-detect-change', (payload) => {
            fireCount++
            payloadChanges = payload.changes
        })

        diskUtil.createDir(this.cwd)

        await this.startWatching(feature)

        const expectedChanges: any[] = []
        for (let idx = 0; idx < changeCount; idx++) {
            const filename = `index-${idx}.js`
            diskUtil.writeFile(
                this.resolvePath('build', filename),
                'console.log("hello world")'
            )
            expectedChanges.push({
                id: 'generatedFile',
                values: {
                    action: 'generated',
                    path: this.resolvePath('build', filename),
                    name: filename,
                },
            })
        }

        await this.stopWatching(feature)

        assert.isEqual(fireCount, 1)
        assert.isTrue(payloadChanges.length >= changeCount)

        for (const expected of expectedChanges) {
            assert.doesInclude(payloadChanges, expected)
        }
    }

    @test()
    protected static async canTrackAddingDir() {
        await this.watchRunStop(async () => {
            const newDirDest = this.resolvePath('build', 'new_dir')
            diskUtil.createDir(newDirDest)

            const expected: GeneratedFileOrDir[] = [
                {
                    id: 'generatedDir',
                    values: {
                        action: 'generated',
                        name: 'new_dir',
                        path: this.resolvePath('build', 'new_dir'),
                    },
                },
            ]
            return expected
        })
    }

    @test()
    protected static async canTrackDeletingDir() {
        const newDirDest = this.resolvePath('build', 'new_dir')
        diskUtil.createDir(newDirDest)

        await this.watchRunStop(async () => {
            diskUtil.deleteDir(newDirDest)

            const expected: GeneratedFileOrDir[] = [
                {
                    id: 'generatedDir',
                    values: {
                        action: 'deleted',
                        name: 'new_dir',
                        path: this.resolvePath('build', 'new_dir'),
                    },
                },
            ]

            return expected
        })
    }

    @test()
    protected static async canTrackDeletingFile() {
        const newFile = this.resolvePath('build', 'test.js')
        diskUtil.writeFile(newFile, 'test')

        await this.watchRunStop(async () => {
            diskUtil.deleteFile(newFile)

            const expected: GeneratedFileOrDir[] = [
                {
                    id: 'generatedFile',
                    values: {
                        action: 'deleted',
                        name: 'test.js',
                        path: this.resolvePath('build', 'test.js'),
                    },
                },
            ]
            return expected
        })
    }

    @test()
    protected static async canTrackDeletingFileInDirectory() {
        const newDirDest = this.resolvePath('build', 'new_dir')
        diskUtil.createDir(newDirDest)

        const newFile = this.resolvePath('build', 'new_dir', 'test.js')
        diskUtil.writeFile(newFile, 'test')

        await this.watchRunStop(async () => {
            diskUtil.deleteFile(newFile)

            const expected: GeneratedFileOrDir[] = [
                {
                    id: 'generatedFile',
                    values: {
                        action: 'deleted',
                        name: 'test.js',
                        path: this.resolvePath('build', 'new_dir', 'test.js'),
                    },
                },
            ]

            return expected
        })
    }

    private static async stopWatching(feature: WatchFeature) {
        await this.wait(3000)
        await feature.stopWatching()
    }

    private static async startWatching(feature: WatchFeature) {
        void feature.startWatching({ delay: 0 })
        await this.wait(1000)
    }

    protected static async watchRunStop(
        runner: () => Promise<GeneratedFileOrDir[]>
    ) {
        const cli = await this.installWatch()
        const feature = cli.getFeature('watch')

        let payloadChanges: any = {}
        void cli.on('watcher.did-detect-change', (payload) => {
            payloadChanges = payload.changes
        })

        await this.startWatching(feature)

        const expected: GeneratedFileOrDir[] = await runner()

        await this.stopWatching(feature)

        for (const e of expected) {
            assert.doesInclude(payloadChanges, e)
        }
    }

    private static async installWatch() {
        const fixture = this.FeatureFixture()
        const cli = await fixture.installFeatures([{ code: 'watch' }])
        return cli
    }
}
