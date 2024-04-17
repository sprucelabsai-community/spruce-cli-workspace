import { test, assert } from '@sprucelabs/test-utils'
import AbstractCliTest from '../../tests/AbstractCliTest'
import WidgetFactory from '../../widgets/WidgetFactory'

export default class WidgetsTest extends AbstractCliTest {
    private static factory: WidgetFactory

    protected static async beforeEach() {
        await super.beforeEach()
        this.factory = new WidgetFactory()
    }

    @test()
    protected static async canCreateFactory() {
        assert.isTruthy(this.factory)
    }

    @test()
    protected static async canCreateTextWidget() {
        const log = this.buildText()
        assert.isTruthy(log)
    }

    @test()
    protected static async setsStartingFrame() {
        const text = this.buildText()
        assert.isEqualDeep(text.getFrame(), {
            left: 0,
            top: 0,
            width: 4,
            height: 4,
        })
    }

    @test()
    protected static canCreateWindow() {
        const window = this.factory.Widget('window', {})
        assert.isTruthy(window)
    }

    @test()
    protected static canCreateProgressBar() {
        const progress = this.factory.Widget('progressBar', {
            progress: 0,
        })
        assert.isTruthy(progress)
    }

    @test()
    protected static canCreateText() {
        const text = this.factory.Widget('text', {})
        assert.isTruthy(text)
    }

    @test.skip('enable when ready to fake termkit')
    protected static canCreateLayout() {
        const window = this.factory.Widget('window', {})
        const layout = this.factory.Widget('layout', {
            parent: window,
            width: '100%',
            rows: [
                {
                    id: 'row_1',
                    height: '100%',
                    columns: [
                        {
                            id: 'column_1',
                            width: '100%',
                        },
                    ],
                },
            ],
        })
        assert.isTruthy(layout)

        const column = layout.getChildById('results')

        assert.isTruthy(column)
    }

    private static buildText() {
        return this.factory.Widget('text', {
            left: 0,
            top: 0,
            width: 4,
            height: 4,
        })
    }
}
