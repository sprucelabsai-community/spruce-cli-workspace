import { AbstractEventEmitter } from '@sprucelabs/mercury-event-emitter'
import { EventContract } from '@sprucelabs/mercury-types'
import { Terminal } from 'terminal-kit'
import {
    BaseWidget,
    UniversalWidgetOptions,
    WidgetFrame,
    WidgetFrameCalculated,
    WidgetPadding,
} from '../types/widgets.types'

export type BaseWidgetWithTermKitAddons = BaseWidget & {
    getTermKitElement: () => any | null
}

export type TkWidgetOptions = UniversalWidgetOptions & {
    term: Terminal
    parent: BaseWidgetWithTermKitAddons
}

export default abstract class TkBaseWidget<Contract extends EventContract = any>
    extends AbstractEventEmitter<Contract>
    implements BaseWidget<Contract>
{
    public type = 'abstract'
    protected parent: BaseWidgetWithTermKitAddons | null
    protected term: Terminal
    private id: string | null
    private children: BaseWidget[] = []
    protected shouldLockWidthWithParent = false
    protected shouldLockHeightWithParent = false
    protected shouldLockRightWithParent = false
    protected shouldLockBottomWithParent = false
    protected padding: WidgetPadding = {}
    private frameLockDeltas: {
        leftDelta: number
        widthDelta: number
        topDelta: number
        heightDelta: number
        rightDelta: number
        bottomDelta: number
    } = {
        leftDelta: 0,
        widthDelta: 0,
        topDelta: 0,
        heightDelta: 0,
        rightDelta: 0,
        bottomDelta: 0,
    }

    public constructor(options: TkWidgetOptions) {
        super(options.eventContract ?? { eventSignatures: {} })

        this.parent = options.parent ?? null
        this.term = options.term
        this.id = options.id ?? null
        this.shouldLockHeightWithParent =
            options.shouldLockHeightWithParent ?? false
        this.shouldLockWidthWithParent =
            options.shouldLockWidthWithParent ?? false
        this.shouldLockRightWithParent =
            options.shouldLockRightWithParent ?? false
        this.shouldLockBottomWithParent =
            options.shouldLockBottomWithParent ?? false

        this.padding = {
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            ...options.padding,
        }

        if (this.parent) {
            this.parent.addChild(this as TkBaseWidget)
        }
    }

    public getChildren(): BaseWidget[] {
        return this.children
    }

    public addChild(child: BaseWidget): void {
        this.children.push(child)
    }

    public getId(): string | null {
        return this.id
    }

    public getParent(): BaseWidget | null {
        return this.parent
    }

    public getFrame(): WidgetFrameCalculated {
        const element = this.getTermKitElement()
        if (element) {
            return {
                left: element.outputX,
                top: element.outputY,
                width: element.outputWidth,
                height: element.outputHeight,
            }
        }
        throw new Error(
            element
                ? `${this.type} does not implement getFrame()`
                : `${this.type} does not implement getTermKitElement()`
        )
    }

    public setFrame(frame: Partial<WidgetFrame>): void {
        const element = this.getTermKitElement()

        if (element) {
            if (element.resize) {
                element.resize({
                    x: frame.left,
                    y: frame.top,
                    width: frame.width,
                    height: frame.height,
                })
            } else {
                element.outputX = frame.left ?? element.outputX
                element.outputY = frame.top ?? element.outputY
                element.outputWidth = frame.width ?? element.outputWidth
                element.outputHeight = frame.height ?? element.outputHeight
            }

            this.sizeLockedChildren()

            element.draw()

            return
        }

        throw new Error(`${this.type} does not implement getTermKitElement()`)
    }

    protected sizeLockedChildren() {
        const newFrame = this.getFrame()
        for (const child of this.children as TkBaseWidget[]) {
            child.handleParentResize(newFrame)
        }
    }

    public getChildById(id?: string): BaseWidget | null {
        for (const child of this.getChildren()) {
            if (child.getId() === id) {
                return child
            }
        }

        return null
    }

    public removeChild(child: BaseWidget) {
        this.children = this.children.filter((c) => c !== child)
    }

    protected handleParentResize(parentFrame: WidgetFrameCalculated): void {
        const updatedFrame = this.getFrame()
        let shouldSetFrame = false

        if (this.shouldLockHeightWithParent) {
            shouldSetFrame = true
            updatedFrame.height =
                parentFrame.height - this.frameLockDeltas.heightDelta
        }

        if (this.shouldLockWidthWithParent) {
            shouldSetFrame = true
            updatedFrame.width =
                parentFrame.width - this.frameLockDeltas.widthDelta
        }

        if (this.shouldLockRightWithParent) {
            shouldSetFrame = true
            updatedFrame.left =
                parentFrame.width -
                this.frameLockDeltas.rightDelta -
                updatedFrame.width
        }

        if (this.shouldLockBottomWithParent) {
            shouldSetFrame = true
            updatedFrame.top =
                parentFrame.height -
                updatedFrame.height -
                this.frameLockDeltas.bottomDelta
        }

        if (shouldSetFrame) {
            this.setFrame(updatedFrame)
        }
    }

    public async destroy() {
        this.getTermKitElement()?.destroy()
        this.getParent()?.removeChild(this as BaseWidget)
    }

    public getTermKitElement(): any | null {
        return null
    }

    protected calculateSizeLockDeltas() {
        const frame = this.getFrame()
        const parentFrame = this.getParent()?.getFrame()

        if (!parentFrame) {
            return
        }

        let leftDelta = 0
        let widthDelta = 0
        let topDelta = 0
        let heightDelta = 0
        let rightDelta = 0
        let bottomDelta = 0

        if (this.shouldLockWidthWithParent) {
            leftDelta = frame.left
            widthDelta = parentFrame.width - frame.width
        }

        if (this.shouldLockHeightWithParent) {
            topDelta = frame.top
            heightDelta = parentFrame.height - frame.height
        }

        if (this.shouldLockRightWithParent) {
            rightDelta = frame.left + frame.width - parentFrame.width
        }

        if (this.shouldLockBottomWithParent) {
            bottomDelta = parentFrame.height - (frame.top + frame.height)
        }

        this.frameLockDeltas = {
            leftDelta,
            widthDelta,
            topDelta,
            heightDelta,
            rightDelta,
            bottomDelta,
        }
    }
}
