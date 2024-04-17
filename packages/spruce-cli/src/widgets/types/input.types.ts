import { buildSchema } from '@sprucelabs/schema'
import { BaseWidget } from './widgets.types'

export const inputEventContract = {
    eventSignatures: {
        submit: {
            emitPayloadSchema: buildSchema({
                id: 'inputSubmitEmitPayload',
                fields: {
                    value: {
                        type: 'raw',
                        isRequired: true,
                        options: {
                            valueType: 'string | undefined',
                        },
                    },
                },
            }),
        },
        cancel: {},
    },
}

export type InputEventContract = typeof inputEventContract

export interface InputWidgetOptions {
    value?: string
    label?: string
    placeholder?: string
}

export interface InputWidget extends BaseWidget<InputEventContract> {
    readonly type: 'input'
    getValue(): string | undefined
    setValue(value: string): void
}
