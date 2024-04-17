import terminal_kit from 'terminal-kit'
import { Key } from '../keySelectChoices'
import { BaseWidget } from '../types/widgets.types'
import { WindowWidget, WindowWidgetOptions } from '../types/window.types'
import TkBaseWidget, { TkWidgetOptions } from './TkBaseWidget'
const termKit = terminal_kit as any

export default class TkWindowWidget
    extends TkBaseWidget
    implements WindowWidget
{
    public readonly type = 'window'

    private document: any

    public constructor(options: TkWidgetOptions & WindowWidgetOptions) {
        super(options)

        //@ts-ignore
        this.document = this.term.createDocument({
            palette: new termKit.Palette(),
        })

        this.document.eventSource.on('resize', async () => {
            this.handleParentResize()
            const frame = this.getFrame()
            await (this as WindowWidget).emit('resize', {
                width: frame.width,
                height: frame.height,
            })
        })

        this.document.__widget = this

        options.term.on('key', this.handleKeyPress.bind(this))

        process.on('exit', (code: number) => {
            void (this as WindowWidget).emit('kill', { code })
        })

        process.on('SIGQUIT', (code: number) => {
            void (this as WindowWidget).emit('kill', { code })
        })

        process.on('kill', (code: number) => {
            void (this as WindowWidget).emit('kill', { code })
        })

        process.on('SIGINT', (code: number) => {
            void (this as WindowWidget).emit('kill', { code })
        })

        process.on('SIGTERM', (code: number) => {
            void (this as WindowWidget).emit('kill', { code })
        })

        process.on('SIGUSR1', (code: number) => {
            void (this as WindowWidget).emit('kill', { code })
        })

        process.on('SIGUSR2', (code: number) => {
            void (this as WindowWidget).emit('kill', { code })
        })

        process.on('uncaughtException', (code: number) => {
            void (this as WindowWidget).emit('kill', { code })
        })
    }

    public getFocusedWidget(): BaseWidget<any> | null {
        return this.document.focusElement.__widget
    }

    private async handleKeyPress(key: Key) {
        await (this as WindowWidget).emit('key', { key })
    }

    protected handleParentResize() {
        this.sizeLockedChildren()
    }

    public setTitle(title: string) {
        this.term.windowTitle(title)
    }

    public hideCursor() {
        this.term.hideCursor(true)
    }

    public showCursor() {
        this.term.hideCursor(false)
    }

    public getFrame() {
        return {
            left: 0,
            top: 0,
            width: this.document.inputWidth,
            height: this.document.inputHeight,
        }
    }

    public getTermKitElement() {
        return this.document
    }

    public async destroy() {
        this.showCursor()
        //@ts-ignore
        this.term.removeAllListeners()

        this.term.styleReset()

        await this.term.grabInput(false, true)

        // termkit destroys all children, so we don't need to call for each children
        // this may change if destroy is required in other widgets and there appears
        // to be no penalty for calling destroy multiple times
        this.document.destroy()

        this.term.clear()

        this.term(`\n`)
    }
}
