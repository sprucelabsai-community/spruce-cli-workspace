import { BaseWidget } from './widgets.types'

export const buttonEventContract = {
    eventSignatures: {
        click: {},
    },
}

export type ButtonEventContract = typeof buttonEventContract

export interface ButtonWidgetOptions {
    text?: string
}

export interface ButtonWidget extends BaseWidget<ButtonEventContract> {
    readonly type: 'button'
    getText(): string
    setText(content: string): void
}
