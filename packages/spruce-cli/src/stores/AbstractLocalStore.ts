import AbstractStore from './AbstractStore'
import { StoreOptions } from './AbstractStore'

export interface LocalStoreSettings {}

export default abstract class AbstractLocalStore<
    Settings extends LocalStoreSettings,
> extends AbstractStore {
    public constructor(options: StoreOptions) {
        super(options)
    }

    private get settings() {
        return this.Service('settings')
    }

    protected writeValue<F extends keyof Settings>(key: F, value: Settings[F]) {
        this.writeValues({ [key]: value })
        return
    }

    protected writeValues<T extends Record<string, any>>(values: T) {
        const settings = { ...this.readSettings(), ...values }
        this.settings.set('stores', settings)

        return this
    }

    protected readValue<F extends keyof Settings>(key: F) {
        const settings = this.readValues()
        return settings[key]
    }

    protected readValues<T extends Settings>(): Partial<T> {
        const values = this.readSettings()
        return values
    }

    private readSettings() {
        return this.settings.get('stores') ?? {}
    }
}
