import pathUtil from 'path'
import globby from '@sprucelabs/globby'
import { namesUtil } from '@sprucelabs/spruce-skill-utils'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { SpruceSchemas } from '#spruce/schemas/schemas.types'
import createTestActionSchema from '#spruce/schemas/spruceCli/v2020_07_22/createTestOptions.schema'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'
import TestFeature, { ParentClassCandidate } from '../TestFeature'

export default class CreateAction extends AbstractAction<OptionsSchema> {
    public optionsSchema = createTestActionSchema
    public invocationMessage = 'Creating a test... 🛡'

    public async execute(options: Options): Promise<FeatureActionResponse> {
        const normalizedOptions = this.validateAndNormalizeOptions(options)
        const { testDestinationDir, namePascal, nameCamel, type } =
            normalizedOptions

        let resolvedDestination = diskUtil.resolvePath(
            this.cwd,
            testDestinationDir,
            type
        )

        let parentTestClass:
            | undefined
            | { name: string; importPath: string; isDefaultExport: boolean }

        const testFeature = this.parent as TestFeature
        const candidates = await testFeature.buildParentClassCandidates()

        if (diskUtil.doesDirExist(resolvedDestination)) {
            resolvedDestination =
                await this.promptForSubDir(resolvedDestination)
        }

        if (candidates.length > 0) {
            parentTestClass =
                await this.promptForParentTestClassAndOptionallyInstallDependencies(
                    candidates,
                    parentTestClass,
                    resolvedDestination
                )
        }

        this.ui.startLoading('Generating test file...')

        const writer = this.Writer('test')

        const isTestFixturesInstalled = !!this.Service('pkg').get(
            'devDependencies.@sprucelabs/spruce-test-fixtures'
        )

        let doesStaticTestExist =
            await this.doesStaticTestAlreadyExist(resolvedDestination)

        const results = await writer.writeTest(resolvedDestination, {
            ...normalizedOptions,
            type,
            nameCamel,
            parentTestClass,
            isTestFixturesInstalled,
            namePascal: namePascal ?? namesUtil.toPascal(nameCamel),
            testType: doesStaticTestExist ? 'static' : 'instance',
        })

        return {
            files: results,
            hints: ["run `spruce test` in your skill when you're ready!"],
        }
    }

    private async doesStaticTestAlreadyExist(resolvedDestination: string) {
        const matches = await globby(resolvedDestination + `/**/*.test.ts`)
        let doesStaticTestExist = false

        const match = matches[0]
        if (match) {
            const contents = diskUtil.readFile(matches[0])
            doesStaticTestExist = contents.includes('protected static')
        }
        return doesStaticTestExist
    }

    private async promptForSubDir(resolvedDestination: string) {
        const match = await this.ui.prompt({
            type: 'directory',
            label: 'Where should I write this test?',
            isRequired: true,
            defaultValue: {
                path: diskUtil.resolvePath(resolvedDestination),
            },
        })

        resolvedDestination = diskUtil.resolvePath(
            resolvedDestination,
            match.path
        )

        return resolvedDestination
    }

    private async promptForParentTestClassAndOptionallyInstallDependencies(
        candidates: ParentClassCandidate[],
        parentTestClass:
            | { name: string; importPath: string; isDefaultExport: boolean }
            | undefined,
        resolvedDestination: string
    ) {
        const idx = await this.ui.prompt({
            type: 'select',
            isRequired: true,
            label: 'Which abstract test class do you want to extend?',
            options: {
                choices: [
                    { value: '', label: 'AbstractSpruceTest (default)' },
                    ...candidates.map((candidate, idx) => ({
                        value: `${idx}`,
                        label: candidate.label,
                    })),
                ],
            },
        })

        if (idx !== '' && candidates[+idx]) {
            const match = candidates[+idx]

            if (match) {
                await this.optionallyInstallFeatureBasedOnSelection(match)

                parentTestClass = this.buildParentClassFromCandidate(
                    match,
                    resolvedDestination
                )
            }
        }
        return parentTestClass
    }

    private async optionallyInstallFeatureBasedOnSelection(
        match: ParentClassCandidate
    ) {
        if (match.featureCode) {
            const isInstalled = await this.features.isInstalled(
                match.featureCode
            )

            if (!isInstalled) {
                this.ui.startLoading(`Installing ${match.name}...`)
                await this.features.install({
                    features: [{ code: match.featureCode as any }],
                })
                this.ui.stopLoading()
            }
        }
    }

    private buildParentClassFromCandidate(
        match: ParentClassCandidate,
        resolvedDestination: string
    ): {
        name: string
        label: string
        importPath: string
        isDefaultExport: boolean
    } {
        return {
            name: match.name,
            label: match.label,
            isDefaultExport: match.isDefaultExport,
            importPath:
                match.import ??
                diskUtil.resolveRelativePath(
                    resolvedDestination,
                    //@ts-ignore
                    match.path.replace(pathUtil.extname(match.path), '')
                ),
        }
    }
}

type OptionsSchema = SpruceSchemas.SpruceCli.v2020_07_22.CreateTestOptionsSchema
type Options = SpruceSchemas.SpruceCli.v2020_07_22.CreateTestOptions
