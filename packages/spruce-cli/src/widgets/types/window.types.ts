import { buildSchema } from '@sprucelabs/schema'
import keySelectChoices from '../keySelectChoices'
import { BaseWidget } from './widgets.types'

// ** Window Widget ** //
export const windowEventContract = {
	eventSignatures: {
		key: {
			emitPayloadSchema: buildSchema({
				id: 'windowKeyEmitPayload',
				fields: {
					key: {
						type: 'select',
						isRequired: true,
						options: {
							choices: keySelectChoices,
						},
					},
				},
			}),
		},
		kill: {
			emitPayloadSchema: buildSchema({
				id: 'killEmitPayload',
				fields: {
					code: {
						type: 'number',
						isRequired: true,
					},
				},
			}),
		},
	},
}

export type WindowEventContract = typeof windowEventContract

export interface WindowWidgetOptions {}

export interface WindowWidget extends BaseWidget<WindowEventContract> {
	readonly type: 'window'
	hideCursor: () => void
	showCursor: () => void
	setTitle: (title: string) => void
	getFocusedWidget(): BaseWidget | null
}
