import { SchemaError } from '@sprucelabs/schema'
import terminal_kit from 'terminal-kit'
import {
	LayoutColumn,
	LayoutRow,
	LayoutWidget,
	LayoutWidgetOptions,
} from '../types/layout.types'
import { WidgetFrameAttribute, WidgetFrame } from '../types/widgets.types'
import termKitUtil from './termKit.utility'
import TkBaseWidget, { TkWidgetOptions } from './TkBaseWidget'
import TkLayoutCellWidget from './TkLayoutCellWidget'
const termKit = terminal_kit as any

export default class TkLayoutWidget
	extends TkBaseWidget
	implements LayoutWidget
{
	public readonly type = 'layout'

	private layout: any

	public constructor(options: TkWidgetOptions & LayoutWidgetOptions) {
		super(options)

		const mappedOptions = termKitUtil.mapWidgetOptionsToTermKitOptions(options)

		const { parent, ...layout } = mappedOptions

		if (!parent) {
			throw new SchemaError({
				code: 'MISSING_PARAMETERS',
				parameters: ['parent'],
			})
		}

		this.layout = new termKit.Layout({
			parent,
			layout,
		})

		this.layout.__widget = this
		this.layout.off('parentResize', this.layout.onParentResize)

		this.calculateSizeLockDeltas()
	}

	public getChildren() {
		return this.layout.zChildren.map((child: any) => {
			return new TkLayoutCellWidget({
				term: this.term,
				termKitElement: child,
				parent: this,
			})
		})
	}

	public getTermKitElement() {
		return this.layout
	}

	public getFrame() {
		return {
			left: this.layout.computed.xmin,
			top: this.layout.computed.ymin,
			width: this.layout.computed.width,
			height: this.layout.computed.height,
		}
	}

	public async destroy() {
		this.layout.destroy()
	}

	public setFrame(frame: Partial<WidgetFrame>) {
		const calculated = termKitUtil.buildFrame(frame, this.parent)
		const def = this.layout.layoutDef

		delete def.height
		delete def.heightPercent

		this.layout.layoutDef.height = calculated.height

		this.handleResize()
	}

	private handleResize() {
		this.layout.computeBoundingBoxes()
		this.layout.draw()

		this.sizeLockedChildren()
	}

	public getRows(): LayoutRow[] {
		const rows = this.layout.layoutDef.rows
		const layoutRows = this.termKitRowsToLayoutRows(rows)

		return layoutRows
	}

	private termKitRowsToLayoutRows(rows: any): LayoutRow[] {
		return rows.map((row: any) => ({
			...termKitUtil.mapTermKitOptionsToWidgetOptions(row),
			columns: this.termKitColumnsToLayoutColumns(row.columns),
		}))
	}

	private termKitColumnsToLayoutColumns(columns: any) {
		return columns.map((col: any) =>
			termKitUtil.mapTermKitOptionsToWidgetOptions(col)
		)
	}

	public addRow(row: LayoutRow): void {
		this.layout.layoutDef.rows.push({
			...termKitUtil.mapWidgetOptionsToTermKitOptions(row),
			columns: this.widgetColumnsToTermKitColumns(row.columns),
		})
	}

	public removeRow(rowIdx: number): void {
		this.layout.layoutDef.rows.splice(rowIdx, 1)
	}

	public removeColumn(rowIdx: number, columnIdx: number): void {
		const row = this.layout.layoutDef.rows[rowIdx]
		if (row) {
			row.columns.splice(columnIdx, 1)
		} else {
			throw new Error(
				`Can't add remove column because row at index ${rowIdx} does not exist.`
			)
		}
	}

	public addColumn(rowIdx: number, column: LayoutColumn): void {
		if (this.layout.layoutDef.rows[rowIdx]) {
			this.layout.layoutDef.rows[rowIdx].columns.push({
				...termKitUtil.mapWidgetOptionsToTermKitOptions(column),
			})
		} else {
			throw new Error(
				`Can't add column because row at index ${rowIdx} does not exist.`
			)
		}
	}

	public setColumnWidth(options: {
		rowIdx: number
		columnIdx: number
		width: WidgetFrameAttribute
	}): void {
		const { rowIdx, columnIdx, width } = options

		const col = this.layout.layoutDef.rows[rowIdx]?.columns[columnIdx]
		if (col) {
			this.layout.layoutDef.rows[rowIdx].columns[columnIdx] = {
				...col,
				...termKitUtil.mapWidgetOptionsToTermKitOptions({ width }),
			}
		} else {
			throw new Error(
				`Can't add set column width because column ${columnIdx} at row ${rowIdx} does not exist.`
			)
		}
	}

	private widgetColumnsToTermKitColumns(columns: LayoutColumn[]) {
		return columns.map((column) => ({
			...termKitUtil.mapWidgetOptionsToTermKitOptions(column),
		}))
	}

	public setRowHeight(rowIdx: number, height: WidgetFrameAttribute): void {
		this.layout.layoutDef.rows[rowIdx] = {
			...this.layout.layoutDef.rows[rowIdx],
			...termKitUtil.mapWidgetOptionsToTermKitOptions({ height }),
		}
	}

	public updateLayout() {
		this.handleResize()
	}
}
