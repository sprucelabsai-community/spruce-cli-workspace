import pathUtil from 'path'
import {
    buildPermissionContract,
    EventSignature,
} from '@sprucelabs/mercury-types'
import {
    buildEmitTargetAndPayloadSchema,
    eventContractUtil,
    eventTargetSchema,
} from '@sprucelabs/spruce-event-utils'
import {
    diskUtil,
    MERCURY_API_NAMESPACE,
    namesUtil,
    versionUtil,
} from '@sprucelabs/spruce-skill-utils'
import { test, assert, generateId } from '@sprucelabs/test-utils'
import { generateEventContractFileName } from '../../../features/event/writers/EventWriter'
import { FeatureActionResponse } from '../../../features/features.types'
import LintService from '../../../services/LintService'
import AbstractEventTest from '../../../tests/AbstractEventTest'
import testUtil from '../../../tests/utilities/test.utility'
import { RegisteredSkill } from '../../../types/cli.types'

export default class KeepingEventsInSyncTest extends AbstractEventTest {
    private static randomVersion = 'v2020_01_01'

    private static get todaysVersion() {
        return versionUtil.generateVersion()
    }

    @test.skip('find how to simulate connection errors')
    protected static async syncingSchemasWithDisconnectedStopsWithError() {
        await this.FeatureFixture().installCachedFeatures('events')

        await this.syncCoreEventsPretendingToBeMercuryTypes()

        const results = await this.Action('schema', 'sync').execute({})

        const match = testUtil.assertFileByNameInGeneratedFiles(
            'sendMessageEmitPayload.schema.ts',
            results.files
        )

        assert.isTrue(diskUtil.doesFileExist(match))

        const client = await this.getMercuryFixture().connectToApi({
            shouldAuthAsCurrentSkill: true,
        })

        await client.disconnect()

        const results2 = await this.Action('schema', 'sync').execute({})

        assert.isTruthy(results2.errors)

        assert.isTrue(diskUtil.doesFileExist(match))
    }

    @test()
    protected static async syncingSchemasDoesNotSyncEventSchemasIfEventsNotInstalled() {
        await this.FeatureFixture().installCachedFeatures('schemas')
        const results = await this.Action('schema', 'sync').execute({})

        assert.doesThrow(() => this.assertCorePayloadSchemasAreCreated(results))
    }

    @test()
    protected static async canGetNumberOfEventsBackFromHealthCheck() {
        const cli = await this.FeatureFixture().installCachedFeatures('events')
        LintService.enableLinting()
        const results = await this.Action('event', 'sync').execute({})

        assert.isFalsy(results.errors)

        await this.Service('build').build()

        const health = await cli.checkHealth({ shouldRunOnSourceFiles: false })

        assert.isTruthy(health.skill)
        assert.isFalsy(health.skill.errors)
        assert.isTruthy(health.event)
        assert.isEqual(health.event.status, 'passed')
        assert.isTruthy(health.event.contracts)

        assert.isAbove(health.event.contracts.length, 0)
    }

    @test()
    protected static async syncsEventsFromOtherSkills() {
        const { skillFixture, skill2 } =
            await this.seedDummySkillRegisterCurrentSkillAndInstallToOrg()

        const eventName = `my-new-event::${this.todaysVersion.constValue}`
        const fqen = `${skill2.slug}.my-new-event::${this.todaysVersion.constValue}`

        const description = generateId() + '"' + '"'
        const aiInstructions = generateId() + '"' + '"'

        await skillFixture.registerEventContract(skill2, {
            eventSignatures: {
                [eventName]: {
                    description,
                    aiInstructions,
                    emitPayloadSchema: buildEmitTargetAndPayloadSchema({
                        eventName: 'my-new-event',
                        targetSchema: eventTargetSchema,
                        payloadSchema: {
                            id: 'myNewEventEmitPayloadId',
                            fields: { onlyField: { type: 'text' } },
                        },
                    }),
                    responsePayloadSchema: {
                        id: 'myNewEventResponsePayloadId',
                        fields: {},
                    },
                    emitPermissionContract: buildPermissionContract({
                        id: 'myNewEventEmitPermissionContract',
                        name: 'My new event emit permissionContract',
                        permissions: [
                            {
                                id: 'can-emit',
                                name: 'Can emit my new event',
                                defaults: {
                                    guest: {
                                        default: true,
                                    },
                                },
                            },
                        ],
                    }),
                    listenPermissionContract: buildPermissionContract({
                        id: 'myNewEventListenPermissionContract',
                        name: 'My new event listen permissionContract',
                        permissions: [
                            {
                                id: 'can-listen',
                                name: 'Can emit my new event',
                                defaults: {
                                    guest: {
                                        default: true,
                                    },
                                },
                            },
                        ],
                    }),
                },
            },
        })

        this.Service('dependency').add({
            id: skill2.id,
            namespace: skill2.slug,
        })

        const results = await this.Action('event', 'sync').execute({})

        const match = testUtil.assertFileByNameInGeneratedFiles(
            `myNewEvent.${this.todaysVersion.dirValue}.contract.ts`,
            results.files
        )

        assert.doesInclude(
            match,
            `${namesUtil.toCamel(skill2.slug)}${pathUtil.sep}myNewEvent.${
                this.todaysVersion.dirValue
            }.contract.ts`
        )

        const contract = (await this.Service('import').importDefault(
            match
        )) as any
        const sig = eventContractUtil.getSignatureByName(contract, fqen)

        assert.isTruthy(sig.emitPayloadSchema)
        assert.isTruthy(
            //@ts-ignore
            sig.emitPayloadSchema.fields?.payload?.options?.schema?.id,
            'myNewEventEmitPayloadId'
        )
        assert.isTruthy(
            sig.responsePayloadSchema?.id,
            'myNewEventResponsePayloadId'
        )

        assert.isTruthy(sig.emitPermissionContract)
        assert.isEqual(
            sig.emitPermissionContract.id,
            `${skill2.slug}.myNewEventEmitPermissionContract`
        )
        assert.isEqual(sig.emitPermissionContract.permissions[0].id, 'can-emit')
        assert.isTruthy(sig.listenPermissionContract)
        assert.isEqual(
            sig.listenPermissionContract.id,
            `${skill2.slug}.myNewEventListenPermissionContract`
        )
        assert.isEqual(
            sig.listenPermissionContract.permissions[0].id,
            'can-listen'
        )

        assert.isEqual(sig.description, description, 'description missing')
        assert.isEqual(
            sig.aiInstructions,
            aiInstructions,
            'aiInstructions missing'
        )
    }

    @test()
    protected static async twoSkillsWithSameEventCanBeSynced() {
        const { skill2, skillFixture, orgFixture, org } =
            await this.seedDummySkillRegisterCurrentSkillAndInstallToOrg()

        const skill3 = await skillFixture.seedDemoSkill({
            name: 'a third skill',
        })

        await orgFixture.installSkillAtOrganization(skill3.id, org.id)

        const eventName = `my-new-event::${this.todaysVersion.constValue}`

        await skillFixture.registerEventContract(skill2, {
            eventSignatures: {
                [eventName]: {
                    emitPayloadSchema: buildEmitTargetAndPayloadSchema({
                        eventName: 'my-new-event',
                        targetSchema: eventTargetSchema,
                    }),
                },
            },
        })

        await skillFixture.registerEventContract(skill3, {
            eventSignatures: {
                [eventName]: {
                    emitPayloadSchema: buildEmitTargetAndPayloadSchema({
                        eventName: 'my-new-event',
                        targetSchema: eventTargetSchema,
                    }),
                },
            },
        })

        await this.Service('dependency').set([
            {
                id: skill2.id,
                namespace: skill2.slug,
            },
            {
                id: skill3.id,
                namespace: skill3.slug,
            },
        ])

        const results = await this.Action('event', 'sync').execute({})

        const contract = testUtil.assertFileByNameInGeneratedFiles(
            'events.contract.ts',
            results.files
        )

        await this.Service('typeChecker').check(contract)
    }

    @test()
    protected static async skillWithSameEventNameButDifferentVersionsCanBeSynced() {
        const { skill2, skillFixture } =
            await this.seedDummySkillRegisterCurrentSkillAndInstallToOrg()

        const eventName = `my-new-event::${this.todaysVersion.constValue}`
        const eventName2 = `my-new-event::${this.randomVersion}`

        await skillFixture.registerEventContract(skill2, {
            eventSignatures: {
                [eventName]: {
                    emitPayloadSchema: buildEmitTargetAndPayloadSchema({
                        eventName: 'my-new-event',
                        targetSchema: eventTargetSchema,
                    }),
                },
                [eventName2]: {
                    emitPayloadSchema: buildEmitTargetAndPayloadSchema({
                        eventName: 'my-new-event',
                        targetSchema: eventTargetSchema,
                    }),
                },
            },
        })

        await this.Service('dependency').add({
            id: skill2.id,
            namespace: skill2.slug,
        })

        const results = await this.Action('event', 'sync').execute({})

        const contract = testUtil.assertFileByNameInGeneratedFiles(
            'events.contract.ts',
            results.files
        )

        await this.Service('typeChecker').check(contract)
    }

    @test()
    protected static async unRegisteredEventsAreRemoved() {
        const { skillFixture, syncResults, skill2, contractFileName } =
            await this.seedSkillsAndRegisterAndSyncEvents()

        await this.assertValidActionResponseFiles(syncResults)

        await skillFixture.unRegisterEvents(skill2, {
            shouldUnregisterAll: true,
        })

        const eventContract = testUtil.assertFileByNameInGeneratedFiles(
            contractFileName,
            syncResults.files
        )

        assert.isTrue(diskUtil.doesFileExist(eventContract))

        await this.Action('event', 'sync').execute({})

        assert.isFalse(diskUtil.doesFileExist(eventContract))

        const dirname = pathUtil.dirname(eventContract)
        assert.isFalse(diskUtil.doesDirExist(dirname))
    }

    private static async syncCoreEventsPretendingToBeMercuryTypes() {
        const results = await this.Action('event', 'sync').execute({
            shouldSyncOnlyCoreEvents: true,
            eventBuilderFile: '../../../builder',
            skillEventContractTypesFile: '../../builder',
        })

        const builder = `
export function buildEventContract(..._: any[]):any { return _[0] }
export function buildPermissionContract(..._: any[]):any { return _[0] }
`

        diskUtil.writeFile(this.resolvePath('src', 'builder.ts'), builder)
        await this.Service('pkg').uninstall([
            '@sprucelabs/mercury-types',
            '@sprucelabs/mercury-client',
            '@sprucelabs/spruce-event-plugin',
        ])
        return results
    }

    private static async seedSkillsAndRegisterAndSyncEvents(
        signature?: EventSignature
    ) {
        const { skill2, skillFixture, cli } =
            await this.seedDummySkillRegisterCurrentSkillAndInstallToOrg()

        const { results, filename } = await this.registerEventAndSync(
            skill2,
            signature
        )

        return {
            skillFixture,
            syncResults: results,
            cli,
            skill2,
            contractFileName: filename,
        }
    }

    private static async registerEventAndSync(
        skill: RegisteredSkill,
        signature?: EventSignature
    ) {
        const skillFixture = this.getSkillFixture()
        const stamp = new Date().getTime()
        const eventName = `cleanup-event-test-${stamp}::${this.todaysVersion.constValue}`
        const filename = generateEventContractFileName({
            nameCamel: `cleanupEventTest${stamp}`,
            version: this.todaysVersion.constValue,
        })

        await skillFixture.registerEventContract(skill, {
            eventSignatures: {
                [eventName]: {
                    emitPayloadSchema: buildEmitTargetAndPayloadSchema({
                        eventName,
                        targetSchema: eventTargetSchema,
                    }),
                    ...signature,
                },
            },
        })

        await this.Service('dependency').add({
            id: skill.id,
            namespace: skill.slug,
        })

        const results = await this.Action('event', 'sync').execute({})

        return { results, filename }
    }

    private static assertCorePayloadSchemasAreCreated(
        results: FeatureActionResponse,
        shouldHaveWritten = true
    ) {
        const filesToCheck = [
            {
                name: `unregisterListenersEmitTargetAndPayload.schema.ts`,
                path: `schemas${pathUtil.sep}${MERCURY_API_NAMESPACE}`,
            },
        ]

        this.assertFilesWereGenerated(filesToCheck, results, shouldHaveWritten)
    }

    private static assertFilesWereGenerated(
        filesToCheck: { name: string; path: string }[],
        results: FeatureActionResponse,
        shouldHaveWritten = true
    ) {
        for (const file of filesToCheck) {
            const expected = this.resolveHashSprucePath(
                'schemas/mercury/v2020_12_25',
                file.name
            )
            const doesExist = diskUtil.doesFileExist(expected)

            if (shouldHaveWritten) {
                assert.isTrue(
                    doesExist,
                    `Expected to find ${file} on the filesystem.`
                )
            } else {
                assert.isFalse(doesExist, `Should not have written ${file}.`)
            }
        }
    }
}
