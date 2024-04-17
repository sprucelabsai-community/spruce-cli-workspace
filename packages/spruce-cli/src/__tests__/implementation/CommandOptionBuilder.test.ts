import { Schema } from '@sprucelabs/schema'
import { test, assert } from '@sprucelabs/test-utils'
import featuresUtil from '../../features/feature.utilities'
import AbstractCliTest from '../../tests/AbstractCliTest'

export default class CommandGeneratorTest extends AbstractCliTest {
    @test()
    protected static hasAliasGenerated() {
        assert.isFunction(featuresUtil.generateOptionAliases)
    }

    @test()
    protected static canAliasOneOptionalField() {
        const person: Schema = {
            id: 'alias-person',
            name: 'person alias',
            fields: {
                firstName: {
                    type: 'text',
                },
            },
        }

        const aliases = featuresUtil.generateOptionAliases(person)

        assert.isLength(Object.keys(aliases), 1)
        assert.doesInclude(aliases, {
            firstName: '--firstName <firstName>',
        })
    }

    @test()
    protected static canAliasTwoFieldsOneRequired() {
        const person: Schema = {
            id: 'alias-person',
            name: 'person alias',
            fields: {
                firstName: {
                    type: 'text',
                },
                lastName: {
                    type: 'text',
                    isRequired: true,
                },
            },
        }

        const aliases = featuresUtil.generateOptionAliases(person)

        assert.isLength(Object.keys(aliases), 2)
        assert.doesInclude(aliases, {
            firstName: '--firstName <firstName>',
        })
        assert.doesInclude(aliases, {
            lastName: '--lastName <lastName>',
        })
    }

    @test()
    protected static properlyHandlesBooleans() {
        const person: Schema = {
            id: 'alias-person',
            name: 'person alias',
            fields: {
                defaultTrue: {
                    type: 'boolean',
                    defaultValue: true,
                },
                defaultFalse: {
                    type: 'boolean',
                    defaultValue: false,
                },
                boolNoDefault: {
                    type: 'boolean',
                },
            },
        }

        const aliases = featuresUtil.generateOptionAliases(person)

        assert.isLength(Object.keys(aliases), 3)
        assert.doesInclude(aliases, {
            defaultTrue: '--defaultTrue [true|false]',
        })
        assert.doesInclude(aliases, {
            defaultFalse: '--defaultFalse [true|false]',
        })

        assert.doesInclude(aliases, {
            boolNoDefault: '--boolNoDefault [true|false]',
        })
    }
}
