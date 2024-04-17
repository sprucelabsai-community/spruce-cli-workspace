import { BaseWidget } from './widgets.types'

// ** Table Widget **//

export interface TableWidgetOptions {}

export interface TableWidget extends BaseWidget {
    type: 'table'
}
