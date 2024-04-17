import { eventNameUtil } from '@sprucelabs/spruce-event-utils'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import AbstractEventTest from '../../../tests/AbstractEventTest'
import testUtil from '../../../tests/utilities/test.utility'

export default class ListeningToAnEventYouCreateTest extends AbstractEventTest {
    @test()
    protected static async canListenToEventWeCreated() {
        const { currentSkill } =
            await this.registerCurrentSkillAndInstallToOrg()

        const eventName = 'register-skill-views'
        const version = 'v2021_04_11'

        const fqen = eventNameUtil.join({
            eventName,
            eventNamespace: currentSkill.slug,
            version,
        })

        const source = this.resolveTestPath(
            'skill_register_skill_views_event/src'
        )
        const destination = this.resolvePath('src')

        await diskUtil.copyDir(source, destination)

        const listenPromise = this.Action('event', 'listen').execute({})

        await this.waitForInput()
        await this.ui.sendInput(currentSkill.slug)

        await this.waitForInput()
        await this.ui.sendInput(fqen)

        const results = await listenPromise

        assert.isFalsy(results.errors)

        const match = testUtil.assertFileByNameInGeneratedFiles(
            `${eventName}.${version}.listener.ts`,
            results.files
        )

        assert.doesInclude(
            match,
            diskUtil.resolvePath('listeners', currentSkill.slug)
        )

        await this.assertClientIsProperlyTyped(currentSkill.slug)
    }

    private static async assertClientIsProperlyTyped(eventNamespace: string) {
        const sourceFile = this.resolvePath('src/client-type-test.ts.hbs')
        const contents = diskUtil
            .readFile(sourceFile)
            .replace('{{eventNamespace}}', eventNamespace)

        const destinationFile = this.resolvePath('src/client-type-test.ts')
        diskUtil.writeFile(destinationFile, contents)

        await this.Service('typeChecker').check(destinationFile)
    }
}
