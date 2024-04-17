import { EventContract, MercuryEventEmitter } from '@sprucelabs/mercury-types'

export interface WidgetPadding {
    top?: number
    left?: number
    bottom?: number
    right?: number
}

export interface WidgetButton {
    label: string
    onClick?: (cb: () => void) => void
}

export interface BaseWidget<Contract extends EventContract = any>
    extends MercuryEventEmitter<Contract> {
    type: string
    getId(): string | null
    getFrame(): WidgetFrameCalculated
    setFrame(frame: Partial<WidgetFrame>): void
    getParent(): BaseWidget | null
    destroy(): Promise<void>
    getChildById(id?: string): BaseWidget | null
    getChildren(): BaseWidget[]
    addChild(child: BaseWidget): void
    removeChild(child: BaseWidget): void
}

export type Color =
    | 'black'
    | 'red'
    | 'green'
    | 'yellow'
    | 'blue'
    | 'magenta'
    | 'cyan'
    | 'white'
    | 'gray'
    | 'brightRed'
    | 'brightGreen'
    | 'brightYellow'
    | 'brightBlue'
    | 'brightMagenta'
    | 'brightCyan'
    | 'brightWhite'

export interface UniversalWidgetOptions {
    id?: string
    width?: WidgetFrameAttribute
    height?: WidgetFrameAttribute
    left?: WidgetFrameAttribute
    top?: WidgetFrameAttribute
    parent?: BaseWidget
    padding?: WidgetPadding
    shouldLockWidthWithParent?: boolean
    shouldLockHeightWithParent?: boolean
    shouldLockRightWithParent?: boolean
    shouldLockBottomWithParent?: boolean
    eventContract?: EventContract
    backgroundColor?: Color
    foregroundColor?: Color
}

export interface WidgetFrame {
    left: WidgetFrameAttribute
    top: WidgetFrameAttribute
    width: WidgetFrameAttribute
    height: WidgetFrameAttribute
}

export interface WidgetFrameCalculated {
    left: number
    top: number
    width: number
    height: number
}

export type WidgetFrameAttribute = number | string
