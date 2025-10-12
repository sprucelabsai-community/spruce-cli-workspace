import { MercuryClientFactory } from '@sprucelabs/mercury-client'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { assert, generateId, test } from '@sprucelabs/test-utils'
import ActionFactory from '../../../features/ActionFactory'
import SyncAction, {
    SyncPermissionsOptions,
} from '../../../features/permission/actions/SyncAction'
import { ListPermContractsTargetAndPayload } from '../../../features/permission/stores/PermissionStore'
import testUtil from '../../../tests/utilities/test.utility'
import { ListSkill } from '../../support/EventFaker'
import AbstractPermissionsTest from './support/AbstractPermissionsTest'
import generateShortAlphaId from './support/generateShortAlphaId'

export default class SyncingPermissionsTest extends AbstractPermissionsTest {
    private static syncAction: SyncAction
    private static contractId1: string
    private static contractId2: string
    private static heartwoodSkill: ListSkill = {
        id: generateId(),
        slug: 'heartwood',
        dateCreated: 0,
        name: 'Heartwood',
    }

    protected static async beforeAll() {
        await super.beforeAll()
        this.contractId1 = 'b-should-be-second' + generateShortAlphaId()
        this.contractId2 = 'a-should-be-first' + generateShortAlphaId()
    }

    protected static async beforeEach() {
        await super.beforeEach()

        this.syncAction = this.Action('permission', 'sync')

        MercuryClientFactory.setIsTestMode(true)
        ExecuteTrackingAction.wasExecuteInvoked = false
        await this.eventFaker.fakeListPermissionContracts()

        await this.eventFaker.fakeListSkills(() => {
            return [this.heartwoodSkill]
        })
    }

    @test()
    protected static async generatesExpectedTypesFile() {
        const results = await this.sync()
        const expected = this.getTypesPath()
        testUtil.assertFileByPathInGeneratedFiles(expected, results.files)
    }

    @test()
    protected static async syncsNewPermissionsWhenMade() {
        await this.createPermissionContract(this.contractId1)
        await this.writeTestFileAndAssertValid(
            `testing-permissions.${this.contractId1}`
        )
    }

    @test()
    protected static async upgradingSyncsPermissions() {
        this.beginTrackingExecute()
        await this.emitDidExecuteUpgrade()
        assert.isTrue(ExecuteTrackingAction.wasExecuteInvoked)
    }

    @test()
    protected static async doesNotSyncIfNotInstalled() {
        this.beginTrackingExecute()
        this.featureInstaller.isInstalled = async (code) => code === 'node'

        await this.emitDidExecuteUpgrade()
        assert.isFalse(ExecuteTrackingAction.wasExecuteInvoked)
    }

    @test()
    protected static async generatesCombinedFile() {
        assert.isTrue(diskUtil.doesFileExist(this.getCombinedPath()))
    }

    @test()
    protected static async combinedFileImportsAllPermissions() {
        await this.createPermissionContract(this.contractId2)

        const imported = await this.import()

        assert.isEqualDeep(imported, [
            {
                id: this.contractId2,
                name: this.contractId2,
                description: '',
                requireAllPermissions: false,
                permissions: [
                    {
                        id: 'can-high-five',
                        name: 'Can give high five',
                        description:
                            'Will this person be allowed to high five?',
                        defaults: { skill: false },
                        requireAllStatuses: false,
                    },
                ],
            },
            {
                id: this.contractId1,
                name: this.contractId1,
                description: '',
                requireAllPermissions: false,
                permissions: [
                    {
                        id: 'can-high-five',
                        name: 'Can give high five',
                        description:
                            'Will this person be allowed to high five?',
                        defaults: { skill: false },
                        requireAllStatuses: false,
                    },
                ],
            },
        ])
    }

    @test()
    protected static async canSyncCorePermissions() {
        let wasHit = false
        let passedTarget: ListPermContractsTargetAndPayload['target']

        await this.eventFaker.fakeListPermissionContracts(
            (targetAndPayload) => {
                passedTarget = targetAndPayload.target
                wasHit = true
            }
        )

        await this.sync({ shouldSyncCorePermissions: true })
        assert.isTrue(wasHit, 'Did not emit list-permission-contracts event')
        assert.isUndefined(
            passedTarget,
            'Should not have passed a target to list-permission-contracts'
        )
    }

    @test()
    protected static async syncingEventsSyncsPermissions() {
        this.beginTrackingExecute()
        await this.emitter.emitAndFlattenResponses('feature.did-execute', {
            actionCode: 'sync',
            featureCode: 'event',
            results: {},
        })
        assert.isTrue(ExecuteTrackingAction.wasExecuteInvoked)
    }

    @test()
    protected static async permsSentInAlphabeticalOrder() {
        await this.addHeartwoodAsDependency()
        await this.fakeHeartwoodPermContracts()

        await this.sync()
        const contents = this.readTypesFile()

        const firstId = contents.indexOf('perk-a-should-be-first')
        const secondId = contents.indexOf('perk-should-be-second')
        const thirdId = contents.indexOf('perl-a-should-be-first')
        const fourthId = contents.indexOf('perl-should-be-second')
        const fifthId = contents.indexOf('perm-a-should-be-first')
        const sixthId = contents.indexOf('perm-should-be-second')

        assert.isTrue(
            firstId < secondId,
            'Permissions are not in alphabetical order'
        )

        assert.isTrue(
            secondId < thirdId,
            'Permissions are not in alphabetical order'
        )

        assert.isTrue(
            thirdId < fourthId,
            'Permissions are not in alphabetical order'
        )

        assert.isTrue(
            fourthId < fifthId,
            'Permissions are not in alphabetical order'
        )

        assert.isTrue(
            fifthId < sixthId,
            'Permissions are not in alphabetical order'
        )
    }

    private static async fakeHeartwoodPermContracts() {
        await this.eventFaker.fakeListPermissionContracts(() => {
            return [
                {
                    id: 'ab-' + generateShortAlphaId(),
                    contract: {
                        id: 'ab-' + generateShortAlphaId(),
                        name: generateId(),
                        permissions: [
                            {
                                id: 'perl-should-be-second',
                                name: 'Should be second',
                            },
                            {
                                id: 'perl-a-should-be-first',
                                name: 'Should be first',
                            },
                        ],
                    },
                },
                {
                    id: 'ba-' + generateShortAlphaId(),
                    contract: {
                        id: 'ba-' + generateShortAlphaId(),
                        name: generateId(),
                        permissions: [
                            {
                                id: 'perm-should-be-second',
                                name: 'Should be second',
                            },
                            {
                                id: 'perm-a-should-be-first',
                                name: 'Should be first',
                            },
                        ],
                    },
                },
                {
                    id: 'aa-' + generateShortAlphaId(),
                    contract: {
                        id: 'aa-' + generateShortAlphaId(),
                        name: generateId(),
                        permissions: [
                            {
                                id: 'perk-should-be-second',
                                name: 'Should be second',
                            },
                            {
                                id: 'perk-a-should-be-first',
                                name: 'Should be first',
                            },
                        ],
                    },
                },
            ]
        })
    }

    private static async import() {
        return await this.Service('import').importDefault(
            this.getCombinedPath()
        )
    }

    private static async addHeartwoodAsDependency() {
        const results = await this.Action('dependency', 'add').execute({
            namespace: 'heartwood',
        })

        assert.isFalsy(results.errors, 'Should not have errored')
    }

    private static readTypesFile() {
        return diskUtil.readFile(this.getTypesPath())
    }

    private static getTypesPath() {
        return this.resolveHashSprucePath(`permissions/permissions.types.ts`)
    }

    private static getCombinedPath() {
        return this.resolveHashSprucePath('permissions', 'permissions.ts')
    }

    private static beginTrackingExecute() {
        ActionFactory.setActionClass(
            'permission',
            'sync',
            ExecuteTrackingAction
        )
    }

    private static async sync(options?: SyncPermissionsOptions) {
        const results = await this.syncAction.execute(options)
        assert.isFalsy(
            results.errors,
            'Should not have errored when syncing permissions'
        )

        return results
    }

    private static async emitDidExecuteUpgrade() {
        await this.emitter.emitAndFlattenResponses('feature.did-execute', {
            actionCode: 'upgrade',
            featureCode: 'node',
            results: {},
        })
    }
}

class ExecuteTrackingAction extends SyncAction {
    public static wasExecuteInvoked = false
    public async execute() {
        ExecuteTrackingAction.wasExecuteInvoked = true
        return {}
    }
}
