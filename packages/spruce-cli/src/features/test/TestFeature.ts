import { eventResponseUtil } from '@sprucelabs/spruce-event-utils'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import SpruceError from '../../errors/SpruceError'
import PkgService from '../../services/PkgService'
import { NpmPackage } from '../../types/cli.types'
import tsConfigUtil from '../../utilities/tsConfig.utility'
import AbstractFeature, { FeatureDependency } from '../AbstractFeature'
import ParentTestFinder from '../error/ParentTestFinder'
import { FeatureCode } from '../features.types'

declare module '../../features/features.types' {
    interface FeatureMap {
        test: TestFeature
    }
}

export interface ParentClassCandidate {
    name: string
    label: string
    path?: string
    import?: string
    isDefaultExport: boolean
    featureCode?: FeatureCode
}

export default class TestFeature extends AbstractFeature {
    public nameReadable = 'Testing'
    public description = 'Test first. Test everything! 💪'
    public code: FeatureCode = 'test'
    public dependencies: FeatureDependency[] = [
        { code: 'skill', isRequired: false },
        { code: 'node', isRequired: true },
    ]
    public packageDependencies: NpmPackage[] = [
        { name: '@sprucelabs/test@latest', isDev: true },
        { name: '@sprucelabs/test-utils@latest', isDev: true },
        { name: '@sprucelabs/jest-json-reporter@latest', isDev: true },
        { name: '@sprucelabs/spruce-test-fixtures@latest', isDev: true },
        { name: 'jest-circus', isDev: true },
        { name: 'jest', isDev: true },
    ]
    public actionsDir = diskUtil.resolvePath(__dirname, 'actions')

    public async afterPackageInstall() {
        const service = this.Service('pkg')

        this.configureJest(service)
        this.configureScripts(service)
        this.configureTsConfig()

        return {}
    }

    private configureTsConfig() {
        try {
            const tsConfig = tsConfigUtil.readConfig(this.cwd)
            if (!tsConfig.compilerOptions.experimentalDecorators) {
                tsConfig.compilerOptions.experimentalDecorators = true
                tsConfigUtil.setCompilerOption(
                    this.cwd,
                    'experimentalDecorators',
                    true
                )
            }
        } catch (err) {
            //@ts-ignore
        }
    }

    private configureScripts(service: PkgService) {
        let scripts = service.get('scripts') as Record<string, any> | undefined

        if (!scripts) {
            scripts = {}
        }

        if (!scripts.test) {
            scripts.test = 'jest'
            scripts['watch.tests'] = 'jest --watch'
            service.set({ path: 'scripts', value: scripts })
        }
    }

    private configureJest(service: PkgService) {
        const jestConfig = {
            testRunner: 'jest-circus/runner',
            maxWorkers: 4,
            testTimeout: 120000,
            testEnvironment: 'node',
            testPathIgnorePatterns: [
                '<rootDir>/tmp/',
                '<rootDir>/src/',
                '<rootDir>/node_modules/',
                '<rootDir>/build/__tests__/testDirsAndFiles/',
            ],
            testMatch: ['**/__tests__/**/*.test.js?(x)'],
            moduleNameMapper: {
                '^#spruce/(.*)$': '<rootDir>/build/.spruce/$1',
            },
        }

        const existingJest = service.get('jest') as Record<string, any>
        if (!existingJest) {
            service.set({ path: 'jest', value: jestConfig })
        }
    }

    public async buildParentClassCandidates(): Promise<ParentClassCandidate[]> {
        const parentFinder = new ParentTestFinder(this.cwd)
        const candidates: ParentClassCandidate[] = (
            await parentFinder.findAbstractTests()
        ).map((a) => ({ ...a, label: a.name }))

        const results = await this.emitter.emit(
            'test.register-abstract-test-classes'
        )

        const { payloads } = eventResponseUtil.getAllResponsePayloadsAndErrors(
            results,
            SpruceError
        )

        for (const payload of payloads) {
            const { abstractClasses } = payload

            for (const ac of abstractClasses) {
                const a = { ...ac, isDefaultExport: false }

                if (ac.featureCode) {
                    const isInstalled = await this.features.isInstalled(
                        ac.featureCode as any
                    )

                    if (!isInstalled) {
                        a.label = `${a.label} (requires install)`
                    }
                }
                candidates.push(a as any)
            }
        }

        candidates.sort((a, b) => {
            if (a.label > b.label) {
                return 1
            } else {
                return -1
            }
        })

        return candidates
    }
}
