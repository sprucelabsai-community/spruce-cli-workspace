import { Schema } from '@sprucelabs/schema'
import TerminalInterface from '../interfaces/TerminalInterface'
import FormComponent, { FormOptions } from './FormComponent'

export default abstract class AbstractComponent {
    protected ui: TerminalInterface
    public constructor(ui: TerminalInterface) {
        this.ui = ui
    }

    public formComponent<T extends Schema>(
        options: Omit<FormOptions<T>, 'term'>
    ): FormComponent<T> {
        const formBuilder = new FormComponent({
            ...options,
        })
        return formBuilder
    }
}
