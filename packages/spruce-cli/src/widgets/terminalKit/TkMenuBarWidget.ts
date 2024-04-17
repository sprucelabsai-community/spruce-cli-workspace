import terminal_kit from 'terminal-kit'
const termKit = terminal_kit as any
import {
    MenuBarWidget,
    MenuBarWidgetItem,
    MenuBarWidgetOptions,
} from '../types/menuBar.types'
import termKitUtil from './termKit.utility'
import TkBaseWidget, { TkWidgetOptions } from './TkBaseWidget'

export default class TkMenuBarWidget
    extends TkBaseWidget
    implements MenuBarWidget
{
    public readonly type = 'menuBar'

    private menu: any

    public constructor(options: TkWidgetOptions & MenuBarWidgetOptions) {
        super(options)

        const frame = termKitUtil.buildFrame(options, options.parent)
        const items = this.mapItemsToTkItems(options.items)

        this.menu = new termKit.DropDownMenu({
            parent: options.parent.getTermKitElement(),
            separator: '|',
            items,
            backgroundAttr: { bgColor: 'black', color: 'white' },
            buttonBlurAttr: { bgColor: 'black', color: 'yellow' },
            buttonFocusAttr: { bgColor: 'yellow', color: 'black' },
            separatorAttr: { bgColor: 'black', color: 'yellow' },
            ...frame,
        })

        this.calculateSizeLockDeltas()

        this.menu.__widget = this
        this.menu.on('submit', this.handleMenuSubmit.bind(this))
    }

    public setTextForItem(value: string, text: string): void {
        let buttonItem = this.getButtonByValue(value, this.menu.buttons)

        if (!buttonItem) {
            for (const item of this.menu.itemsDef) {
                for (const subItem of item.items ?? []) {
                    if (subItem.value === value) {
                        subItem.content = this.buildItemText(text)
                        return
                    }
                }
            }
        }

        if (!buttonItem) {
            throw new Error(`No menu item with value of ${value}`)
        }

        buttonItem.setContent(this.buildItemText(text), true)
    }

    private getButtonByValue(value: string, buttons: any[]) {
        let button: any
        for (const button of buttons) {
            if (button.def.value === value) {
                return button
            }
        }

        return button
    }

    private handleMenuSubmit(value: string) {
        this.menu.clearColumnMenu()
        void (this as MenuBarWidget).emit('select', { value })
    }

    public getTermKitElement() {
        return this.menu
    }

    private mapItemsToTkItems(items: MenuBarWidgetItem[]): any {
        return items.map((item) => ({
            value: item.value,
            content: this.buildItemText(item.label),
            topSubmit: !item.items || item.items.length === 0,
            items: item.items ? this.mapItemsToTkItems(item.items) : undefined,
        }))
    }

    private buildItemText(text: string): string {
        return ` ${text} `
    }
}
