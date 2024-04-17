import { BaseWidget } from './widgets.types'

export interface ProgressBarWidgetOptions {
    label?: string
    progress: number
}

export interface ProgressBarWidget extends BaseWidget {
    readonly type: 'progressBar'

    setLabel(label?: string): void
    setProgress(progress: number): void
}
