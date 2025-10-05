import { assert, generateId, test } from '@sprucelabs/test-utils'
import AgentStore from '../../../features/agent/stores/AgentStore'
import { SkillStore } from '../../../features/skill/stores/SkillStore'
import AbstractSkillTest from '../../../tests/AbstractSkillTest'

export default class RegisteringAnAgentAtBootTest extends AbstractSkillTest {
    protected static skillCacheKey = 'events'
    private static agentName = generateId()
    private static agents: AgentStore
    private static skills: SkillStore

    protected static async beforeEach() {
        await super.beforeEach()
        this.agents = this.Store('agent')
        this.skills = this.Store('skill')
    }

    @test()
    protected static async canCreateRegisteringAnAgentAtBoot() {
        const results = await this.Action('agent', 'register', {
            shouldAutoHandleDependencies: true,
        }).execute({
            type: 'system',
            name: this.agentName,
        })

        const expectedPlugin = this.resolvePath(
            'src',
            '.spruce',
            'features',
            'agent.plugin.ts'
        )

        const expectedPrompt = this.resolvePath('agents/SYSTEM_PROMPT.md')
        assert.isEqualDeep(results.files, [
            {
                path: expectedPlugin,
                name: 'agent.plugin.ts',
                action: 'generated',
                description: 'Supports your skill with registering ai agents.',
            },
            {
                path: expectedPrompt,
                name: 'SYSTEM_PROMPT.md',
                action: 'generated',
                description: `The prompt file that defines how your AI Platform Agent behaves.`,
            },
        ])
    }

    @test()
    protected static async bootingRegistersTheAgent() {
        await this.loginAndRegisterSkill()
        await this.boot()

        const agent = await this.getPlatformAgent()
        assert.isTruthy(agent, 'Did not register an agent at boot.')
        assert.isEqual(
            agent.name,
            this.agentName,
            'Did not set name correctly.'
        )
    }

    private static async loginAndRegisterSkill() {
        await this.people.loginAsDemoPerson()
        await this.skills.register({
            name: 'Agent skill',
        })
    }

    private static async boot() {
        await this.Action('skill', 'boot').execute({})
    }

    private static async getPlatformAgent() {
        return await this.agents.getPlatformAgent()
    }
}
