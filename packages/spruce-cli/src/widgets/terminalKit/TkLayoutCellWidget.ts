import {
    LayoutCellWidget,
    LayoutCellWidgetOptions,
} from '../types/layout.types'
import TkBaseWidget, { TkWidgetOptions } from './TkBaseWidget'

export default class TkLayoutCellWidget
    extends TkBaseWidget
    implements LayoutCellWidget
{
    public readonly type = 'layoutCell'

    private cell: any

    public constructor(
        options: TkWidgetOptions &
            LayoutCellWidgetOptions & { termKitElement: any }
    ) {
        super({
            shouldLockHeightWithParent: true,
            shouldLockWidthWithParent: true,
            ...options,
        })

        this.cell = options.termKitElement
        this.cell.__widget = this
    }

    public getId() {
        return this.cell.id
    }

    public getTermKitElement() {
        return this.cell
    }

    public getFrame() {
        return {
            left: this.cell.outputDst.x,
            top: this.cell.outputDst.y,
            width: this.cell.inputWidth,
            height: this.cell.inputHeight,
        }
    }

    public setFrame() {
        this.sizeLockedChildren()
    }
}
