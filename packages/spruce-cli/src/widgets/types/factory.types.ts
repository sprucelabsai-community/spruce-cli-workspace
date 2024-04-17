import TKButtonWidget from '../terminalKit/TKButtonWidget'
import TkInputWidget from '../terminalKit/TkInputWidget'
import TkLayoutCellWidget from '../terminalKit/TkLayoutCellWidget'
import TkLayoutWidget from '../terminalKit/TkLayoutWidget'
import TkMenuBarWidget from '../terminalKit/TkMenuBarWidget'
import TkPopupWidget from '../terminalKit/TkPopupWidget'
import TkProgressBarWidget from '../terminalKit/TkProgressBarWidget'
import TkTextWidget from '../terminalKit/TkTextWidget'
import TkWindowWidget from '../terminalKit/TkWindowWidget'
import {
    buttonEventContract,
    ButtonWidget,
    ButtonWidgetOptions,
} from './button.types'
import {
    inputEventContract,
    InputWidget,
    InputWidgetOptions,
} from './input.types'
import {
    LayoutWidgetOptions,
    LayoutWidget,
    LayoutCellWidgetOptions,
    LayoutCellWidget,
} from './layout.types'
import {
    MenuBarWidgetOptions,
    MenuBarWidget,
    menuBarEventContract,
} from './menuBar.types'
import { PopupWidget, PopupWidgetOptions } from './popup.types'
import {
    ProgressBarWidgetOptions,
    ProgressBarWidget,
} from './progressBar.types'
import { TextWidgetOptions, TextWidget, textEventContract } from './text.types'
import { UniversalWidgetOptions } from './widgets.types'
import {
    WindowWidgetOptions,
    WindowWidget,
    windowEventContract,
} from './window.types'

export type WidgetType = keyof WidgetRegistry

export type Widget<T extends WidgetType = WidgetType> = WidgetRegistry[T]

export type FactoryOptions<T extends WidgetType> = UniversalWidgetOptions &
    OptionsMap[T]

interface OptionsMap {
    text: TextWidgetOptions
    window: WindowWidgetOptions
    layout: LayoutWidgetOptions
    layoutCell: LayoutCellWidgetOptions
    progressBar: ProgressBarWidgetOptions
    menuBar: MenuBarWidgetOptions
    popup: PopupWidgetOptions
    button: ButtonWidgetOptions
    input: InputWidgetOptions
}

export interface WidgetRegistry {
    text: TextWidget
    window: WindowWidget
    layout: LayoutWidget
    layoutCell: LayoutCellWidget
    progressBar: ProgressBarWidget
    menuBar: MenuBarWidget
    popup: PopupWidget
    button: ButtonWidget
    input: InputWidget
}

export const widgetRegistry = {
    window: TkWindowWidget,
    text: TkTextWidget,
    layout: TkLayoutWidget,
    layoutCell: TkLayoutCellWidget,
    progressBar: TkProgressBarWidget,
    menuBar: TkMenuBarWidget,
    popup: TkPopupWidget,
    button: TKButtonWidget,
    input: TkInputWidget,
}

export const contractRegistry = {
    window: windowEventContract,
    text: textEventContract,
    layout: null,
    layoutCell: null,
    progressBar: null,
    menuBar: menuBarEventContract,
    popup: null,
    button: buttonEventContract,
    input: inputEventContract,
}
