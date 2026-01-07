import { SchemaEntityFactory, StaticSchemaEntity } from '@sprucelabs/schema'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { SpruceSchemas } from '#spruce/schemas/schemas.types'
import onboardingSchema from '#spruce/schemas/spruceCli/v2020_07_22/onboarding.schema'
import AbstractLocalStore, {
    LocalStoreSettings,
} from '../../../stores/AbstractLocalStore'
import { StoreOptions } from '../../../stores/AbstractStore'

export interface OnboardingStoreSettings
    extends
        LocalStoreSettings,
        SpruceSchemas.SpruceCli.v2020_07_22.Onboarding {}

type OnboardingSchema = SpruceSchemas.SpruceCli.v2020_07_22.OnboardingSchema
export type OnboardingMode = OnboardingStoreSettings['mode']
export type OnboardingStage = OnboardingStoreSettings['stage']

export default class OnboardingStore extends AbstractLocalStore<OnboardingStoreSettings> {
    public readonly name = 'onboarding'
    private static cwdOverride: string

    private static schemasByHome: Record<
        string,
        StaticSchemaEntity<OnboardingSchema>
    > = {}

    public constructor(options: StoreOptions) {
        super(options)
        this.cwd = this.generateCwd()
        this.load()
    }

    private get schema() {
        if (!OnboardingStore.schemasByHome[this.homeDir]) {
            OnboardingStore.schemasByHome[this.homeDir] =
                SchemaEntityFactory.Entity(onboardingSchema)
        }

        return OnboardingStore.schemasByHome[this.homeDir]
    }

    private save() {
        const values = this.schema.getValues()
        this.writeValues(values)
        return this
    }

    private load() {
        const saved = this.readValues()
        this.schema.setValues({
            stage: saved.stage ?? null,
            mode: saved.mode ?? 'off',
        })
        return this
    }

    public getMode(): OnboardingMode {
        return this.schema.get('mode')
    }

    public setMode(mode: OnboardingMode) {
        this.schema.set('mode', mode)
        this.schema.validate()
        this.save()
    }

    public getStage() {
        return this.schema.get('stage')
    }

    public setStage(stage: OnboardingStage) {
        this.schema.set('stage', stage)
        this.schema.validate()
        this.save()
    }

    public reset() {
        this.schema.set('stage', undefined)
        this.setMode('off')
    }

    public static overrideCwd(cwd: string) {
        this.cwdOverride = cwd
    }

    protected generateCwd() {
        const home =
            OnboardingStore.cwdOverride ?? diskUtil.createTempDir('spruce-cli')
        return home
    }
}
