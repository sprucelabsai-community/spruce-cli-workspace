import {
    BaseWidget,
    WidgetFrame,
    WidgetFrameCalculated,
} from './types/widgets.types'

const widgetUtil = {
    buildFrame(frame?: Partial<WidgetFrame>, parent?: BaseWidget | null) {
        let { left, top, height, width } = frame || {}

        if (typeof width === 'string') {
            if (!parent) {
                throw new Error(
                    'I can only calculate percentage sizes if a parent is passed.'
                )
            }

            // -2 is for border width, add border support to basewidget when this causes problems
            width = parent.getFrame().width * (parseInt(width, 10) / 100)
        }

        if (typeof height === 'string') {
            if (!parent) {
                throw new Error(
                    'I can only calculate percentage sizes if a parent is passed.'
                )
            }

            height = parent.getFrame().height * (parseInt(height, 10) / 100)
        }

        return { left, top, height, width } as Partial<WidgetFrameCalculated>
    },
}

export default widgetUtil
