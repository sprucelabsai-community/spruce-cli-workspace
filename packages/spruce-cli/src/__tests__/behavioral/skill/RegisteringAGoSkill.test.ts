import { MercuryClientFactory } from '@sprucelabs/mercury-client'
import { test, assert } from '@sprucelabs/test-utils'
import AbstractCliTest from '../../../tests/AbstractCliTest'

export default class RegisteringAGoSkillTest extends AbstractCliTest {
    @test()
    protected static async canCreateRegisteringAGoSkill() {
        MercuryClientFactory.setIsTestMode(true)
        let wasHit = false
        await this.eventFaker.fakeRegisterSkill(() => {
            wasHit = true
        })

        await this.go.initGoProject()

        await this.Action('skill', 'register', {
            shouldAutoHandleDependencies: true,
        }).execute({
            nameReadable: 'My Go Skill',
            nameKebab: 'my-go-skill',
            description: 'A skill built with Go',
        })

        assert.isTrue(wasHit, 'Register skill event was not hit')
    }
}
