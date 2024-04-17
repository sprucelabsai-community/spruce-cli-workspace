import terminal_kit from 'terminal-kit'
import { PopupWidget, PopupWidgetOptions } from '../types/popup.types'
import termKitUtil from './termKit.utility'
import TkBaseWidget, { TkWidgetOptions } from './TkBaseWidget'
const termKit = terminal_kit as any

export default class TkPopupWidget extends TkBaseWidget implements PopupWidget {
    private popup: any

    public readonly type = 'popup'

    public constructor(
        options: TkWidgetOptions & PopupWidgetOptions & { termKitElement: any }
    ) {
        super({
            shouldLockHeightWithParent: true,
            shouldLockWidthWithParent: true,
            ...options,
        })

        const { parent, ...rest } = options

        const frame = termKitUtil.buildFrame(options, parent)

        this.popup = new termKit.Window({
            parent: parent ? parent.getTermKitElement() : undefined,
            movable: true,
            ...rest,
            ...frame,
        })

        this.popup.__widget = this
    }

    public getTermKitElement() {
        return this.popup
    }

    public getFrame() {
        return {
            left: this.popup.outputDst.x,
            top: this.popup.outputDst.y,
            width: this.popup.inputWidth,
            height: this.popup.inputHeight,
        }
    }
}
