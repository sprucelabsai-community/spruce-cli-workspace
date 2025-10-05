import { Remote } from '@sprucelabs/spruce-event-utils'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test } from '@sprucelabs/test-utils'
import RemoteService from '../../../features/event/services/RemoteService'
import ServiceFactory from '../../../services/ServiceFactory'
import AbstractSkillTest from '../../../tests/AbstractSkillTest'

export default class SettingRemoteDoesNotAskTwiceTest extends AbstractSkillTest {
    protected static skillCacheKey = 'tests'
    @test()
    protected static async canSetRemoteWithoutOneAndOnlyBeAskedOnce() {
        ServiceFactory.setServiceClass('remote', CountingRemoteService)

        this.cleanEnv()

        const promise = this.Action('event', 'setRemote', {
            shouldAutoHandleDependencies: true,
        }).execute({})

        await this.confirmInstallSchemaFeature()
        await this.confirmInstallPermissionFeature()

        await this.confirmFinishedInstallingDependencies()
        await this.waitForInput()

        await this.ui.sendInput('local')

        await promise
    }

    private static async confirmFinishedInstallingDependencies() {
        await this.waitForInput()
        await this.pressEnter()
    }

    private static async confirmInstallPermissionFeature() {
        await this.waitForInput()
        await this.pressEnter()
    }

    private static async confirmInstallSchemaFeature() {
        await this.waitForInput()
        await this.pressEnter()
    }

    private static async pressEnter() {
        await this.ui.sendInput('\n')
    }

    private static cleanEnv() {
        const envPath = this.resolvePath('.env')
        diskUtil.deleteFile(envPath)
        diskUtil.writeFile(envPath, 'SKILL_NAME="don\'t double me"')
    }
}

class CountingRemoteService extends RemoteService {
    public static wasCalled = false
    public set(host: Remote) {
        if (CountingRemoteService.wasCalled) {
            throw new Error('Called twice')
        }

        super.set(host)

        CountingRemoteService.wasCalled = true
    }
}
