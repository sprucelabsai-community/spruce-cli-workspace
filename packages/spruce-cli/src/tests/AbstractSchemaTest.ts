import { Schema } from '@sprucelabs/schema'
import {
	CORE_SCHEMA_VERSION,
	diskUtil,
	HealthCheckResults,
	SchemaHealthCheckItem,
} from '@sprucelabs/spruce-skill-utils'
import { assert } from '@sprucelabs/test-utils'
import { FeatureCode } from '../features/features.types'
import { CliBootOptions } from '../types/cli.types'
import AbstractCliTest from './AbstractCliTest'

export default abstract class AbstractSchemaTest extends AbstractCliTest {
	protected static get schemaTypesFile() {
		return this.resolveHashSprucePath('schemas', 'schemas.types.ts')
	}

	protected static get coreSchemaTypesFile() {
		return this.resolveHashSprucePath('schemas', 'core.schemas.types.ts')
	}

	protected static async syncSchemas(cacheKey?: string, syncOptions = {}) {
		const cli = await this.installSchemaFeature(cacheKey)

		await this.Action('schema', 'sync').execute(syncOptions)

		return cli
	}

	protected static generateExpectedHealthSchemas(schemas: Schema[]) {
		const expected = schemas.map((schema) => ({
			// @ts-ignore
			id: schema.id,
			// @ts-ignore
			name: schema.name,
			version: schema.version ?? CORE_SCHEMA_VERSION.constValue,
			namespace: schema.namespace,
			// @ts-ignore
			description: schema.description,
		}))

		const expectedJSon = JSON.stringify(expected)
		const cleanedExpected = JSON.parse(expectedJSon)

		return this.sortSchemas(cleanedExpected) as SchemaHealthCheckItem['schemas']
	}

	protected static sortSchemas(schemas: Schema[]) {
		return schemas.sort((a, b) => (a.id > b.id ? -1 : 1))
	}

	protected static async installSchemaFeature(
		cacheKey?: string,
		bootOptions?: CliBootOptions
	) {
		const fixture = this.FeatureFixture()

		const cli = await fixture.installFeatures(
			[
				{
					code: 'skill',
					options: {
						name: 'testing',
						description: 'this is a great test!',
					},
				},
				{
					code: 'schema',
				},
			],
			cacheKey,
			{ ...(bootOptions || {}), graphicsInterface: this.ui }
		)

		return cli
	}

	protected static async assertHealthySkillNamed(
		name: string,
		expectedHealth: HealthCheckResults = { skill: { status: 'passed' } },
		expectedInstalledSkills: FeatureCode[] = ['skill']
	) {
		const cli = await this.Cli()
		await this.linkLocalPackages()

		const health = await cli.checkHealth()

		// @ts-ignore
		if (health.schema?.schemas) {
			//@ts-ignore
			health.schema.schemas = this.sortSchemas(health.schema.schemas)
		}

		assert.isEqualDeep(health, expectedHealth)

		const packageContents = diskUtil.readFile(this.resolvePath('package.json'))
		assert.doesInclude(packageContents, name)

		for (const code of expectedInstalledSkills) {
			const isInstalled = await this.featureInstaller.isInstalled(code)
			assert.isTrue(isInstalled)
		}
	}
}
