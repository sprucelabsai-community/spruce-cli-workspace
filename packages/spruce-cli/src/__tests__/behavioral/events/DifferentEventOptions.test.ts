import { SpruceSchemas } from '@sprucelabs/mercury-types'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert, generateId } from '@sprucelabs/test-utils'
import AbstractSkillTest from '../../../tests/AbstractSkillTest'
import testUtil from '../../../tests/utilities/test.utility'
import { RegisteredSkill } from '../../../types/cli.types'

export default class EventsWithFeedTemplatesTest extends AbstractSkillTest {
    protected static skillCacheKey = 'events'
    private static eventOptionsFile: string
    private static skill: RegisteredSkill

    @test()
    protected static async feedIsPassedToRegistration() {
        this.skill = await this.registerSkill()

        await this.createEvent()

        const feedTemplate: FeedOptions = {
            template: generateId(),
        }
        this.dropIntoEventOptions(`feed: ${JSON.stringify(feedTemplate)},`)

        const signature = await this.syncAndFetchSignature()

        assert.isEqualDeep(
            signature.feed,
            feedTemplate,
            'Feed template should match.'
        )
    }

    @test()
    protected static async canHandleBackticksInAiInstructions() {
        const aiInstructions = 'Here `there` be dragons'
        this.dropIntoEventOptions(`aiInstructions: '${aiInstructions}',`)

        const signature = await this.syncAndFetchSignature()

        assert.isEqual(
            signature.aiInstructions,
            aiInstructions,
            'AI instructions should match.'
        )
    }

    @test()
    protected static async canHandleBackticksInDescription() {
        const description = 'This event `describes` something'
        this.dropIntoEventOptions(`description: '${description}',`)

        const signature = await this.syncAndFetchSignature()

        assert.isEqual(
            signature.description,
            description,
            'Description should match.'
        )
    }

    private static async syncAndFetchSignature() {
        await this.syncEvents()
        await this.lintBuildAndBoot()
        const signature = await this.fetchCreatedEventSignature()
        return signature
    }

    private static dropIntoEventOptions(dropIn: string) {
        const contents = diskUtil.readFile(this.eventOptionsFile)
        const updated = contents.replace(
            'isGlobal: false,',
            `isGlobal: false, ${dropIn}`
        )

        diskUtil.writeFile(this.eventOptionsFile, updated)
        return updated
    }

    private static async fetchCreatedEventSignature() {
        const client = await this.connectToApi({
            shouldAuthAsCurrentSkill: true,
        })

        const [{ contracts }] = await client.emitAndFlattenResponses(
            'get-event-contracts::v2020_12_25',
            {
                target: {
                    namespaces: [this.skill.slug],
                },
            }
        )
        const first = contracts[0]
        const { eventSignatures } = first
        const fqen = Object.keys(eventSignatures)[0]
        const signature = eventSignatures[fqen]
        return signature
    }

    private static async lintBuildAndBoot() {
        await this.Service('command').execute('yarn fix.lint')
        await this.Service('command').execute('yarn build.dev')
        const boot = await this.Action('skill', 'boot').execute({})
        assert.isFalsy(boot.errors, 'Should not have boot errors.')
        boot.meta?.kill()
    }

    private static async createEvent() {
        const results = await this.Action('event', 'create').execute({
            nameReadable: 'a new event',
            nameKebab: 'my-new-event',
            nameCamel: 'myNewEvent',
        })

        assert.isFalsy(results.errors, 'Should not have errors.')

        this.eventOptionsFile = testUtil.assertFileByNameInGeneratedFiles(
            'event.options.ts',
            results.files
        )
    }

    private static async registerSkill() {
        return await this.getSkillFixture().registerCurrentSkill({
            name: 'current skill',
        })
    }

    private static async syncEvents() {
        const syncResults = await this.Action('event', 'sync').execute({})
        assert.isFalsy(syncResults.errors, 'Should not have sync errors.')
    }
}

type FeedOptions = SpruceSchemas.Mercury.v2020_12_25.FeedOptions
