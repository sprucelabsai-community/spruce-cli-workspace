import terminal_kit from 'terminal-kit'
import { TextWidget, TextWidgetOptions } from '../types/text.types'
import { WidgetFrame } from '../types/widgets.types'
import widgetUtil from '../widget.utilities'
import termKitUtil from './termKit.utility'
import TkBaseWidget, { TkWidgetOptions } from './TkBaseWidget'
const termKit = terminal_kit as any

export default class TkTextWidget extends TkBaseWidget implements TextWidget {
    public readonly type = 'text'

    private text: any
    private shouldAutoScrollWhenAppendingContent: boolean

    public constructor(options: TkWidgetOptions & TextWidgetOptions) {
        super(options)

        const {
            parent,
            text,
            isScrollEnabled: enableScroll = false,
            shouldAutoScrollWhenAppendingContent = true,
            ...rest
        } = options

        this.shouldAutoScrollWhenAppendingContent =
            shouldAutoScrollWhenAppendingContent

        const frame = termKitUtil.buildFrame(options, parent)

        this.text = new termKit.TextBox({
            parent: parent ? parent.getTermKitElement() : undefined,
            scrollable: enableScroll,
            vScrollBar: enableScroll,
            hScrollBar: enableScroll && !rest.wordWrap,
            content: text,
            wordWrap: true,
            ...termKitUtil.mapWidgetOptionsToTermKitOptions(rest),
            ...frame,
        })

        this.calculateSizeLockDeltas()

        this.text.__widget = this
        this.text.on('click', this.handleMouseDown.bind(this))
    }

    private async handleMouseDown(position: { x: number; y: number }) {
        const { x, y } = position

        const line = this.text.content.split('\n')[y]

        await (this as TextWidget).emit('click', {
            text: line,
            row: y,
            column: x,
        })
    }

    public getTermKitElement() {
        return this.text
    }

    public setFrame(frame: WidgetFrame) {
        const oldFrame = this.getFrame()
        const newFrame = widgetUtil.buildFrame(frame, this.parent)

        this.text.setSizeAndPosition({
            x: newFrame.left ?? oldFrame.left,
            y: newFrame.top ?? oldFrame.top,
            width: newFrame.width ?? oldFrame.width,
            height: newFrame.height ?? oldFrame.height,
        })
        this.text.draw()
    }

    public getText(): string {
        return this.text.content
    }

    private isLogScrolledAllTheWay() {
        const scrollDistance = this.getScrollY() * -1
        const contentHeight = this.text.textBuffer.cy
        const visibleHeight = this.text.textAreaHeight
        const maxScrollDistance =
            Math.max(contentHeight, visibleHeight) - visibleHeight
        const isScrolledAllTheWay = scrollDistance >= maxScrollDistance

        return isScrolledAllTheWay
    }

    public getScrollY() {
        return this.text.scrollY
    }

    public getScrollX() {
        return this.text.scrollX
    }

    public setText(content: string): void {
        if (this.getText() === content) {
            return
        }

        const isScrolledAllTheWay = this.isLogScrolledAllTheWay()
        const logSelection = this.text.textBuffer.selectionRegion
        const markupType = this.markupType(content)

        this.text.setContent(content, markupType)

        if (logSelection) {
            this.text.textBuffer.setSelectionRegion(logSelection)
        }

        if (this.shouldAutoScrollWhenAppendingContent && isScrolledAllTheWay) {
            this.text.scrollToBottom()
        }
    }

    private markupType(content: string) {
        const match = /\x1b\[([0-9;]+)m|(.[^\x1b]+)/g.exec(content)
        const markupType = match && match[1] ? 'ansi' : true
        return markupType
    }
}
