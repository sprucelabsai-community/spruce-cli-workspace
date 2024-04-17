import { diskUtil, HASH_SPRUCE_DIR } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import AbstractCliTest from '../../../tests/AbstractCliTest'

export default class SettingUpASkill extends AbstractCliTest {
    @test()
    protected static async failsWithBadParams() {
        const cli = await this.Cli()
        await assert.doesThrowAsync(async () => {
            await cli.installFeatures({
                features: [
                    {
                        // @ts-ignore
                        code: 'skill',
                        options: {
                            // @ts-ignore
                            name2: 'test',
                            description: 'This is such a good skill!',
                        },
                    },
                ],
            })
        }, 'name')
    }

    @test()
    protected static async failsHealthCheckWithNothingInstalled() {
        const cli = await this.Cli()
        const health = await cli.checkHealth()

        assert.isEqual(health.skill.status, 'failed')
        assert.doesInclude(health, {
            'skill.errors[].options.code': 'SKILL_NOT_INSTALLED',
        })
    }

    @test()
    protected static async getsAFailedHealthCheckWhenIndexFileIsMoved() {
        const cli = await this.installSkill()

        diskUtil.moveFile(
            this.resolvePath('src', 'index.ts'),
            this.resolvePath('src', 'index2.ts')
        )

        const health = await cli.checkHealth()

        assert.isEqual(health.skill.status, 'failed')
        assert.doesInclude(health, {
            'skill.errors[].options.code': 'BOOT_ERROR',
        })
    }

    private static async installSkill() {
        const fixture = this.FeatureFixture()
        const cli = await fixture.installCachedFeatures('skills')
        return cli
    }

    @test()
    protected static async getsAGoodHealthCheckAndNothingElse() {
        const cli = await this.installSkill()

        const hashSpruceDir = this.resolveHashSprucePath()
        assert.isTrue(diskUtil.doesDirExist(hashSpruceDir))

        const health = await cli.checkHealth()

        if (health.skill?.errors && health.skill.errors.length > 0) {
            assert.fail(health.skill.errors?.[0].message)
        }

        assert.isEqualDeep(health, { skill: { status: 'passed' } })
    }

    @test()
    protected static async reportsProperInstallResults() {
        const cli = await this.Cli()
        const results = await cli.installFeatures({
            features: [
                {
                    code: 'skill',
                    options: {
                        name: 'Transfer file check skill',
                        description: 'For tracking files copied count',
                    },
                },
            ],
        })

        assert.isTruthy(results.files)
        assert.isAbove(results.files.length, 0)

        const generateFiles = results.files.filter(
            (file) => file.action === 'generated'
        )

        assert.isEqual(generateFiles.length, results.files.length)

        assert.isTruthy(results.packagesInstalled)
        assert.isAbove(results.packagesInstalled.length, 0)

        const hiddenFiles = results.files.filter((file) => file.name[0] === '.')
        assert.isAbove(hiddenFiles.length, 0)

        this.assertDevDependenciesExist()
        this.assertSkillNameIsSaved()
    }

    private static assertSkillNameIsSaved() {
        const env = this.Service('env')
        assert.isTruthy(env.get('SKILL_NAME'))
        assert.isEqual(env.get('SKILL_NAME'), 'Transfer file check skill')
    }

    @test()
    protected static async canAcceptOptionalDestination() {
        const cli = await this.Cli()
        const results = await cli.installFeatures({
            features: [
                {
                    code: 'skill',
                    options: {
                        name: 'Transfer file check skill',
                        description: 'For tracking files copied count',
                        destination: 'taco',
                    },
                },
            ],
        })

        assert.isTrue(diskUtil.doesDirExist(this.resolvePath('taco')))
        assert.isFalse(diskUtil.doesDirExist(this.resolvePath('.env')))
        assert.isTrue(diskUtil.doesDirExist(this.resolvePath('taco', '.env')))
        assert.isFalse(diskUtil.doesFileExist(this.resolvePath('package.json')))
        assert.isFalse(diskUtil.doesFileExist(this.resolvePath('src')))
        assert.isFalse(diskUtil.doesFileExist(this.resolvePath('node_modules')))
        assert.isFalse(
            diskUtil.doesFileExist(this.resolvePath(HASH_SPRUCE_DIR))
        )
        assert.isTrue(
            diskUtil.doesFileExist(this.resolvePath('taco', 'package.json'))
        )

        const first = results.files?.[0]
        assert.isTruthy(first)

        assert.doesInclude(first.path, 'taco')
    }

    protected static assertDevDependenciesExist() {
        const pkg = this.Service('pkg')
        const devDependencies = pkg.get('devDependencies')
        assert.isTruthy(devDependencies)
    }
}
