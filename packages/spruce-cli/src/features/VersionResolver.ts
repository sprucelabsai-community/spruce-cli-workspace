import { assertOptions } from '@sprucelabs/schema'
import {
    GraphicsInterface,
    PkgService,
    versionUtil,
} from '@sprucelabs/spruce-skill-utils'

export default class VersionResolver {
    private constructor(
        private ui: GraphicsInterface,
        private pkg: PkgService
    ) {}

    public static Resolver(ui: GraphicsInterface, pkg: PkgService) {
        assertOptions({ ui, pkg }, ['ui', 'pkg'])
        return new this(ui, pkg)
    }

    public async resolveVersion(
        resolvedDestination: string,
        userSuppliedVersion?: string | null
    ) {
        if (userSuppliedVersion) {
            versionUtil.assertValidVersion(userSuppliedVersion)
        }
        let resolvedVersion = versionUtil.generateVersion(
            userSuppliedVersion ?? undefined
        ).constValue

        if (!userSuppliedVersion) {
            resolvedVersion =
                await this.askForVersionIfTodaysVersionDoesNotExist(
                    resolvedDestination,
                    resolvedVersion
                )
        }

        const version = versionUtil.generateVersion(resolvedVersion).dirValue

        this.persistVersion(version)

        return version
    }

    private persistVersion(version: string) {
        this.pkg.set({
            path: 'skill.version',
            value: version,
        })
    }

    private async askForVersionIfTodaysVersionDoesNotExist(
        resolvedDestination: string,
        fallbackVersion: string
    ) {
        const versions = this.loadVersions(resolvedDestination)
        const choices = this.buildChoices(versions)

        if (versions.length > 0) {
            return await this.ui.prompt({
                type: 'select',
                label: 'Version',
                hint: 'Confirm which version you want to use?',
                isRequired: true,
                options: {
                    choices,
                },
            })
        }
        return fallbackVersion
    }

    private buildChoices(
        versions: { intValue: number; constValue: string; dirValue: string }[]
    ) {
        const todaysVersion = versionUtil.generateVersion()
        const alreadyHasToday = !!versions.find(
            (version) => version.dirValue === todaysVersion.dirValue
        )
        const choices = []

        if (!alreadyHasToday) {
            choices.push({
                label: 'New Version',
                value: todaysVersion.dirValue,
            })
        }

        choices.push(
            ...versions
                .sort((a, b) => {
                    return a.intValue > b.intValue ? -1 : 1
                })
                .map((version) => ({
                    value: version.dirValue,
                    label: version.dirValue,
                }))
        )
        return choices
    }

    private loadVersions(resolvedDestination: string) {
        const versions = versionUtil.getAllVersions(resolvedDestination)
        const persistedVersion = this.pkg.get('skill.version')
        const todaysVersion = versionUtil.generateVersion().dirValue

        if (
            persistedVersion &&
            todaysVersion !== persistedVersion &&
            !versions.find((v) => v.dirValue === persistedVersion)
        ) {
            versions.push({
                intValue:
                    versionUtil.generateVersion(persistedVersion).intValue,
                dirValue: persistedVersion,
                constValue: persistedVersion,
            })
        }
        return versions
    }
}
