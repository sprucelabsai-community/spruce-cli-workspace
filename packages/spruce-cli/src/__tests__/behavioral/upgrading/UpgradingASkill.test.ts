import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import {
    FILE_ACTION_ALWAYS_SKIP,
    FILE_ACTION_OVERWRITE,
    FILE_ACTION_SKIP,
} from '../../../constants'
import AbstractCliTest from '../../../tests/AbstractCliTest'
import { CliInterface, GeneratedFile } from '../../../types/cli.types'
const BROKEN_SKILL_INDEX_CONTENTS = "throw new Error('cheese!')\n"
export default class UpgradingASkillTest extends AbstractCliTest {
    protected static async beforeEach() {
        await super.beforeEach()
        this.commandFaker.fakeRebuild()
    }

    @test()
    protected static async forceEverythingUpgradeOverwritesWhatHasChanged() {
        const cli = await this.installAndBreakSkill('skills')

        this.commandFaker.fakeCleanBuild()
        this.commandFaker.fakeBuild()

        const files: {
            name: string
            path: string
            forceEverythingAction: GeneratedFile['action']
            forceRequiredSkipRestAction: GeneratedFile['action']
        }[] = [
            {
                name: 'index.ts',
                path: 'src/index.ts',
                forceEverythingAction: 'updated',
                forceRequiredSkipRestAction: 'updated',
            },
            {
                name: 'SpruceError.ts',
                path: 'src/errors/SpruceError.ts',
                forceEverythingAction: 'updated',
                forceRequiredSkipRestAction: 'skipped',
            },
            {
                name: 'options.types.ts',
                path: 'src/.spruce/errors/options.types.ts',
                forceEverythingAction: 'updated',
                forceRequiredSkipRestAction: 'skipped',
            },
        ]

        for (const upgradeMode of [
            'forceRequiredSkipRest',
            'forceEverything',
        ]) {
            for (const file of files) {
                this.clearFileIfAboutToBeUpdated(file, upgradeMode)
            }

            const results = await this.Action('node', 'upgrade').execute({
                upgradeMode,
            })

            if (upgradeMode === 'forceRequiredSkipRest') {
                const passedHealthCheck = await cli.checkHealth()
                assert.isEqualDeep(passedHealthCheck, {
                    skill: { status: 'passed' },
                })
            }

            for (const file of files) {
                //@ts-ignore
                const action = file[`${upgradeMode}Action`]
                assert.doesInclude(
                    results.files,
                    {
                        name: file.name,
                        action,
                    },
                    `${
                        file.name
                    } was not ${action} when ${upgradeMode} in \n\n ${JSON.stringify(
                        results.files ?? [],
                        null,
                        2
                    )}`
                )
            }
        }

        const passedHealthCheck = await cli.checkHealth()

        assert.doesInclude(passedHealthCheck, {
            'skill.status': 'passed',
        })
    }

    @test()
    protected static async upgradeWillAskIfYouWantToOverwriteFiles() {
        const cli = await this.installAndBreakSkill('skills')

        const promise = this.Action('node', 'upgrade').execute({
            upgradeMode: 'askForChanged',
        })

        await this.waitForInput()

        await this.assertFailedHealthCheck(cli)

        const last = this.ui.getLastInvocation()

        assert.doesInclude(last, {
            'options.options.choices[].value': FILE_ACTION_OVERWRITE,
        })

        await this.ui.sendInput(FILE_ACTION_OVERWRITE)

        const results = await promise

        assert.isFalsy(results.errors)

        const health = await cli.checkHealth()

        assert.isEqual(health.skill.status, 'passed')
    }

    @test()
    protected static async canSkipFile() {
        const { last, promise } = await this.installBreakAndUpgradeSkill()

        assert.doesInclude(last, {
            'options.options.choices[].value': FILE_ACTION_SKIP,
        })

        await this.ui.sendInput(FILE_ACTION_SKIP)

        await promise

        this.assertSkillIsBroken()
    }

    @test()
    protected static async canAlwaysSkipFiles() {
        const { last, promise } = await this.installBreakAndUpgradeSkill()

        assert.doesInclude(last, {
            'options.options.choices[].value': FILE_ACTION_ALWAYS_SKIP,
        })

        await this.ui.sendInput(FILE_ACTION_ALWAYS_SKIP)

        await promise

        this.assertSkillIsBroken()

        const results = await this.Action('node', 'upgrade').execute({
            upgradeMode: 'askForChanged',
        })

        assert.isFalsy(results.errors)

        this.assertSkillIsBroken()
    }

    @test()
    protected static async upgradesUpdatesPackageScripts() {
        const cli = await this.installSkill('schemas')

        const pkgService = this.Service('pkg')
        pkgService.set({ path: 'scripts', value: {} })

        const failedHealth = await cli.checkHealth()

        assert.doesInclude(failedHealth, {
            'skill.errors[].message': '"health.local" not found',
        })

        await this.Action('node', 'upgrade').execute({})

        const passedHealth = await cli.checkHealth()
        assert.isEqual(passedHealth.skill.status, 'passed')
    }

    private static clearFileIfAboutToBeUpdated(
        file: {
            name: string
            path: string
            forceEverythingAction: GeneratedFile['action']
            forceRequiredSkipRestAction: GeneratedFile['action']
        },
        upgradeMode: string
    ) {
        //@ts-ignore
        if (file[`${upgradeMode}Action`] === 'updated') {
            diskUtil.writeFile(this.resolvePath(file.path), '')
        }
    }

    private static async installAndBreakSkill(cacheKey: string) {
        const cli = await this.installSkill(cacheKey)
        const indexFile = this.resolvePath('src/index.ts')
        diskUtil.writeFile(indexFile, BROKEN_SKILL_INDEX_CONTENTS)
        await this.assertFailedHealthCheck(cli)

        return cli
    }

    private static async installSkill(cacheKey: string) {
        const fixture = this.FeatureFixture()
        const cli = await fixture.installFeatures(
            [
                {
                    code: 'skill',
                    options: {
                        name: 'testing events',
                        description: 'this too, is a great test!',
                    },
                },
            ],
            cacheKey
        )
        return cli
    }

    private static async assertFailedHealthCheck(cli: CliInterface) {
        const failedHealthCheck = await cli.checkHealth()

        assert.doesInclude(failedHealthCheck, {
            'skill.errors[].message': 'cheese',
        })
    }

    private static async installBreakAndUpgradeSkill() {
        await this.installAndBreakSkill('skills')

        const promise = this.Action('node', 'upgrade').execute({
            upgradeMode: 'askForChanged',
        })

        await this.waitForInput()

        const last = this.ui.getLastInvocation()
        return { last, promise }
    }

    private static assertSkillIsBroken() {
        const indexFile = this.resolvePath('src/index.ts')
        const contents = diskUtil.readFile(indexFile)
        assert.isEqual(contents, BROKEN_SKILL_INDEX_CONTENTS)
    }
}
