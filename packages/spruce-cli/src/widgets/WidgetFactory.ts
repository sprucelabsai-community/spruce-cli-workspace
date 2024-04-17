import terminal_kit, { Terminal } from 'terminal-kit'
import {
    contractRegistry,
    FactoryOptions,
    widgetRegistry,
    WidgetRegistry,
    WidgetType,
} from './types/factory.types'
const termKit = terminal_kit as any

export default class WidgetFactory {
    private term: Terminal
    public constructor() {
        this.term = termKit.terminal
    }

    public Widget<T extends WidgetType>(
        type: T,
        options: FactoryOptions<T>
    ): WidgetRegistry[T] {
        const Class = widgetRegistry[type]

        //@ts-ignore
        const instance = new Class({
            ...options,
            term: this.term,
            eventContract: contractRegistry[type] as any,
        })

        //@ts-ignore
        return instance
    }
}
