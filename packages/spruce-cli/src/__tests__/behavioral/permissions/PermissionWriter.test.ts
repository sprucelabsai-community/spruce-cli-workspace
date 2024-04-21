import { PermissionContractMap } from '@sprucelabs/mercury-types'
import { test, generateId, assert } from '@sprucelabs/test-utils'
import { GeneratedFile } from '../../../types/cli.types'
import AbstractPermissionsTest from './support/AbstractPermissionsTest'

export default class PermissionWriterTest extends AbstractPermissionsTest {
    private static file?: GeneratedFile

    protected static async beforeEach(): Promise<void> {
        await super.beforeEach()
        delete this.file
    }

    @test()
    protected static async writesProperContractId() {
        const contractId = generateId()
        const perm1 = generateId()
        const perm2 = generateId()

        //@ts-ignore
        await this.writeTypesFile({
            [contractId]: [perm1, perm2],
        })

        await this.writeTestFileAndAssertValid(contractId, perm1, perm2)
    }

    @test()
    protected static async writeFileIfChangedLints() {
        const writer = this.Writer()
        const destination = this.resolvePath(generateId() + '.ts')
        let passedPattern: string | undefined

        //@ts-ignore
        writer.lint = async (pattern) => {
            passedPattern = pattern
        }

        //@ts-ignore
        await writer.writeFileIfChangedMixinResults(
            destination,
            'contents',
            'test'
        )

        assert.isEqual(passedPattern, destination)
    }

    private static async writeTypesFile(map: PermissionContractMap) {
        const writer = this.Writer()
        await writer.writeTypesFile(this.cwd, map)
    }

    private static Writer() {
        return this.writers.Writer('permission', {
            fileDescriptions: [],
        })
    }
}
