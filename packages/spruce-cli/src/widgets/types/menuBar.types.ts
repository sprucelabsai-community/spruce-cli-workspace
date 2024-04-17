import { buildSchema } from '@sprucelabs/schema'
import { BaseWidget } from './widgets.types'

// **** //
// ** Menu Bar **/

export const menuBarEventContract = {
    eventSignatures: {
        select: {
            emitPayloadSchema: buildSchema({
                id: 'menuBarSelectEmitPayload',
                fields: {
                    value: {
                        type: 'text',
                        isRequired: true,
                    },
                },
            }),
        },
    },
}

export type MenuBarEventContract = typeof menuBarEventContract

export interface MenuBarWidgetOptions {
    items: MenuBarWidgetItem[]
}

export interface MenuBarWidgetItem {
    label: string
    value: string
    items?: MenuBarWidgetItem[]
}

export interface MenuBarWidget extends BaseWidget<MenuBarEventContract> {
    setTextForItem(value: string, text: string): void
    readonly type: 'menuBar'
}
