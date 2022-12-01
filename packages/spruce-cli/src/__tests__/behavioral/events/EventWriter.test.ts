import { namesUtil, versionUtil } from '@sprucelabs/spruce-skill-utils'
import { EventSignatureTemplateItem } from '@sprucelabs/spruce-templates'
import { test, assert, generateId } from '@sprucelabs/test-utils'
import AbstractCliTest from '../../../tests/AbstractCliTest'

export default class EventWriterTest extends AbstractCliTest {
	@test()
	protected static async canCreateEventWriter() {
		await this.FeatureFixture().installCachedFeatures('events')
		const writer = this.writers.Writer('event', { fileDescriptions: [] })
		const name = 'My event'
		const namespace = 'appointments'

		const contractId1 = generateId()
		const contractId2 = generateId()
		const permissionId1 = generateId()
		const permissionId2 = generateId()

		const sig: EventSignatureTemplateItem = {
			isGlobal: true,
			emitPermissions: {
				//@ts-ignore
				contractId: contractId1,
				permissionIdsAny: [permissionId1],
			},
			listenPermissions: {
				//@ts-ignore
				contractId: contractId2,
				permissionIdsAny: [permissionId2],
			},
		}

		const permWriter = this.writers.Writer('permission', {
			fileDescriptions: [],
		})
		await permWriter.writeTypesFile(this.cwd, {
			[contractId1]: [permissionId1],
			[contractId2]: [permissionId2],
		})

		const results = await writer.writeContracts(
			this.resolveHashSprucePath('events'),
			{
				eventBuilderFile: '@sprucelabs/mercury-types',
				schemaTemplateItems: [],
				shouldImportCoreEvents: false,
				skillEventContractTypesFile: '',
				eventContractTemplateItems: [
					{
						imports: [
							{
								importAs: '{ buildEventContract }',
								package: '@sprucelabs/mercury-types',
							},
						],
						isLocal: true,
						nameCamel: namesUtil.toCamel(name),
						namePascal: namesUtil.toPascal(name),
						namespace,
						namespaceCamel: namesUtil.toCamel(namespace),
						namespacePascal: namesUtil.toPascal(namespace),
						version: versionUtil.generateVersion().constValue,
						eventSignatures: {
							test: sig,
						},
					},
				],
			}
		)

		const match = results[0]
		const imported = await this.Service('import').importDefault(match.path)
		assert.isEqualDeep(imported.eventSignatures.test, sig)
	}
}
