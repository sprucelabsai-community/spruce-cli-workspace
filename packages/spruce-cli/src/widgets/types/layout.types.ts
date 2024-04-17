import { WidgetFrameAttribute, BaseWidget } from './widgets.types'

// ** Layout Widget ** //

export interface LayoutWidgetOptions {
    rows: LayoutRow[]
}

export interface LayoutRow {
    id?: string
    columns: LayoutColumn[]
    height?: WidgetFrameAttribute
}

export interface LayoutColumn {
    id: string
    width?: WidgetFrameAttribute
}

export interface LayoutWidget extends BaseWidget {
    readonly type: 'layout'
    getRows(): any[]
    addRow(row: LayoutRow): void
    addColumn(rowIdx: number, colunm: LayoutColumn): void
    removeRow(rowIdx: number): void
    removeColumn(rowIdx: number, columnIdx: number): void
    setRowHeight(rowIdx: number, height: WidgetFrameAttribute): void
    setColumnWidth(options: {
        rowIdx: number
        columnIdx: number
        width: WidgetFrameAttribute
    }): void
    updateLayout(): void
}

export interface LayoutCellWidgetOptions {}

export interface LayoutCellWidget extends BaseWidget {
    readonly type: 'layoutCell'
}
