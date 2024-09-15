import { SelectChoice } from '@sprucelabs/spruce-core-schemas'
import {
    diskUtil,
    PkgService,
    versionUtil,
} from '@sprucelabs/spruce-skill-utils'
import { test, assert, errorAssert } from '@sprucelabs/test-utils'
import VersionResolver from '../../../features/VersionResolver'
import AbstractSkillTest from '../../../tests/AbstractSkillTest'

export default class ResolvingVersionsTest extends AbstractSkillTest {
    protected static skillCacheKey = 'skills'
    private static pkg: PkgService
    private static versions: VersionResolver

    protected static async beforeEach(): Promise<void> {
        await super.beforeEach()
        this.pkg = this.Service('pkg')
        this.versions = VersionResolver.Resolver(this.ui, this.pkg)
    }

    protected static async afterEach(): Promise<void> {
        this.ui.reset()
        await super.afterEach()
    }

    @test()
    protected static async throwsWhenMissingRequired() {
        //@ts-ignore
        const err = assert.doesThrow(() => VersionResolver.Resolver())
        errorAssert.assertError(err, 'MISSING_PARAMETERS', {
            parameters: ['ui', 'pkg'],
        })
    }

    @test()
    protected static async addsVersionToThePackageJson() {
        const version = await this.resolveVersion()
        this.assertSavedVersionEquals(version)
    }

    @test()
    protected static async addsVersionToPackageJsonWhenChoosingDifferentVersion() {
        const version = await this.resolveVersion('v2023_09_16')
        this.assertSavedVersionEquals(version)
    }

    @test()
    protected static async addsVersionFromPackageJsonWhenChoosingDifferentVersion() {
        debugger
        await this.resolveAndAssertChoices([
            this.newVersionChoice,
            this.buildVersionChoice('v2023_09_16'),
        ])
    }

    @test()
    protected static async doesNotAddVersionToChoicesIfDirMatchesVersion() {
        debugger
        this.createVersionDir('v2023_09_16')
        debugger
        await this.resolveAndAssertChoices([
            this.newVersionChoice,
            this.buildVersionChoice('v2023_09_16'),
        ])
    }

    @test()
    protected static async addsVersionChoiceIfVersionInPackageJsonIsDifferent() {
        this.pkg.set({
            path: 'skill.version',
            value: 'v2200_01_01',
        })

        await this.resolveAndAssertChoices([
            this.newVersionChoice,
            this.buildVersionChoice('v2200_01_01'),
            this.buildVersionChoice('v2023_09_16'),
        ])
    }

    @test()
    protected static async doesNotAddVersionChoiceIfSecondDirNameMatches() {
        this.createVersionDir('v2200_01_01')

        await this.resolveAndAssertChoices([
            this.newVersionChoice,
            this.buildVersionChoice('v2200_01_01'),
            this.buildVersionChoice('v2023_09_16'),
        ])
    }

    private static async resolveAndAssertChoices(expected: SelectChoice[]) {
        await this.resolveAndWaitForInput()
        this.assertChoices(expected)
    }

    private static assertChoices(expected: SelectChoice[]) {
        assert.isEqualDeep(this.choices, expected)
    }

    private static buildVersionChoice(version: string): SelectChoice {
        return {
            label: version,
            value: version,
        }
    }

    private static createVersionDir(version: string) {
        const path = this.resolvePath('src', version)
        diskUtil.createDir(path)
    }

    private static get newVersionChoice(): SelectChoice {
        return {
            label: 'New Version',
            value: versionUtil.generateVersion().dirValue,
        }
    }

    private static async resolveAndWaitForInput() {
        void this.resolveVersion()
        await this.ui.waitForInput()
    }

    private static get choices() {
        const { options } = this.ui.getLastInvocation()
        const choices = options.options.choices
        return choices
    }

    private static async resolveVersion(userSuppliedVersion?: string | null) {
        return await this.versions.resolveVersion(
            this.resolvePath('src'),
            userSuppliedVersion
        )
    }

    private static assertSavedVersionEquals(version: string) {
        assert.isEqual(
            this.pkg.get(['skill', 'version']),
            version,
            `The version in the package.json does not match the resolved version`
        )
    }
}
