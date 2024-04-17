import { isObject } from 'lodash'
import { BaseWidget, WidgetFrame } from '../types/widgets.types'
import widgetUtil from '../widget.utilities'

const termKitUtil = {
    buildFrame(frame: Partial<WidgetFrame>, parent?: BaseWidget | null) {
        const calculated = widgetUtil.buildFrame(frame, parent)
        return {
            x: calculated.left,
            y: calculated.top,
            width: calculated.width,
            height: calculated.height,
        }
    },

    mapWidgetOptionsToTermKitOptions(options: Record<string, any>) {
        const mapped: Record<string, any> = {}
        const keys = Object.keys(options)
        const ignores = [
            'shouldLockHeightWithParent',
            'shouldLockWidthWithParent',
            'shouldLockBottomWithParent',
            'term',
        ]

        if (options.backgroundColor) {
            mapped.attr = {
                ...mapped.attr,
                bgColor: options.backgroundColor,
            }
        }

        if (options.foregroundColor) {
            mapped.attr = {
                ...mapped.attr,
                color: options.foregroundColor,
            }
        }

        for (const key of keys) {
            const item = options[key]
            if (Array.isArray(item)) {
                mapped[key] = []
                for (const i of item) {
                    mapped[key].push(this.mapWidgetOptionsToTermKitOptions(i))
                }
            } else {
                switch (key) {
                    case 'left':
                        mapped.x = item
                        break
                    case 'top':
                        mapped.y = item
                        break
                    case 'width':
                        if (typeof item === 'string') {
                            mapped.widthPercent = parseInt(item)
                        } else {
                            mapped.width = item
                        }
                        break
                    case 'height':
                        if (typeof item === 'string') {
                            mapped.heightPercent = parseInt(item)
                        } else {
                            mapped.height = item
                        }
                        break
                    case 'parent':
                        mapped.parent = item.getTermKitElement()
                        break
                    default:
                        if (ignores.indexOf(key) > -1) {
                            break
                        }
                        if (typeof item !== 'function' && isObject(item)) {
                            mapped[key] =
                                this.mapWidgetOptionsToTermKitOptions(item)
                        } else {
                            mapped[key] = item
                        }
                }
            }
        }
        return mapped
    },

    mapTermKitOptionsToWidgetOptions(options: Record<string, any>) {
        const mapped: Record<string, any> = {}
        const keys = Object.keys(options)

        for (const key of keys) {
            const item = options[key]
            if (Array.isArray(item)) {
                mapped[key] = []
                for (const i of item) {
                    mapped[key].push(this.mapTermKitOptionsToWidgetOptions(i))
                }
            } else {
                switch (key) {
                    case 'left':
                        mapped.x = item
                        break
                    case 'top':
                        mapped.y = item
                        break
                    case 'widthPercent':
                        mapped.width = `${item}%`
                        break
                    case 'heightPercent':
                        mapped.height = `${item}%`
                        break
                    case 'parent':
                        mapped.parent = item.getTermKitElement()
                        break
                    default:
                        if (typeof item !== 'function' && isObject(item)) {
                            mapped[key] =
                                this.mapTermKitOptionsToWidgetOptions(item)
                        } else {
                            mapped[key] = item
                        }
                }
            }
        }
        return mapped
    },
}

export default termKitUtil
