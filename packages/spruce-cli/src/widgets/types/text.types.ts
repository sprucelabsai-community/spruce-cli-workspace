import { buildSchema } from '@sprucelabs/schema'
import { BaseWidget } from './widgets.types'

// ** Text Widget ** //

export const textEventContract = {
    eventSignatures: {
        click: {
            emitPayloadSchema: buildSchema({
                id: 'textClickEmitPayload',
                fields: {
                    column: {
                        type: 'number',
                        isRequired: true,
                    },
                    row: {
                        type: 'number',
                        isRequired: true,
                    },
                    text: {
                        type: 'text',
                    },
                },
            }),
        },
    },
}

export type TextEventContract = typeof textEventContract

export interface TextWidgetOptions {
    isScrollEnabled?: boolean
    shouldAutoScrollWhenAppendingContent?: boolean
    wordWrap?: boolean
    text?: string
}

export interface TextWidget extends BaseWidget<TextEventContract> {
    readonly type: 'text'
    getText(): string
    setText(content: string): void
    getScrollX(): number
    getScrollY(): number
}
