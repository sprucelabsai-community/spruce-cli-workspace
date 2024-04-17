import { BaseWidget } from './widgets.types'

export const popupEventContract = {
    eventSignatures: {
        close: {},
    },
}

export type PopupEventContract = typeof popupEventContract

export interface PopupWidgetOptions {
    title?: string
}

export interface PopupWidget extends BaseWidget<PopupEventContract> {
    readonly type: 'popup'
}
