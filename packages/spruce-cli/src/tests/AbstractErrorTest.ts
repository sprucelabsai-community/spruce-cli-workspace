import AbstractCliTest from './AbstractCliTest'

export default abstract class AbstractErrorTest extends AbstractCliTest {
    protected static get errorTypesFile() {
        return this.resolveHashSprucePath('errors', 'errors.types.ts')
    }

    protected static async installErrorFeature(cacheKey?: string) {
        const fixture = this.FeatureFixture()
        const cli = await fixture.installFeatures(
            [
                {
                    code: 'skill',
                    options: {
                        name: 'testing errors',
                        description: 'this is also a great test!',
                    },
                },
                {
                    code: 'error',
                },
            ],
            cacheKey
        )

        return cli
    }
}
