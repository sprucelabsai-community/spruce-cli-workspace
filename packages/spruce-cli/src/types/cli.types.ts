import { MercuryEventEmitter } from '@sprucelabs/mercury-types'
import { HealthCheckResults } from '@sprucelabs/spruce-skill-utils'
import { CommanderStatic } from 'commander'
import { SpruceSchemas } from '#spruce/schemas/schemas.types'
import FeatureInstaller from '../features/FeatureInstaller'
import {
    FeatureAction,
    FeatureActionResponse,
} from '../features/features.types'
import { GlobalEmitter, GlobalEventContract } from '../GlobalEmitter'
import { ApiClient, ApiClientFactory } from './apiClient.types'
import { GraphicsInterface as IGraphicsInterface } from './graphicsInterface.types'
export { NpmPackage } from '@sprucelabs/spruce-skill-utils'

export interface GraphicsInterface extends IGraphicsInterface {
    renderActionSummary(
        results: ExecutionResults & { totalTime?: number }
    ): void
    getCursorPosition(): Promise<{ x: number; y: number } | null>
    moveCursorTo(x: number, y: number): void
    clearBelowCursor(): void
    clear(): void
    waitForEnter(message?: string): Promise<void>
    sendInput(message: string): Promise<void>
    setTitle(title: string): void
}

export type GeneratedFile = SpruceSchemas.SpruceCli.v2020_07_22.GeneratedFile
export type GeneratedDir = SpruceSchemas.SpruceCli.v2020_07_22.GeneratedDir
export type GeneratedFileOrDir =
    SpruceSchemas.SpruceCli.v2020_07_22.WatcherDidDetectChangesEmitPayload['changes'][number]

export interface ExecutionResults extends FeatureActionResponse {
    featureCode: string
    actionCode: string
    headline: string
    action: FeatureAction
    namespace?: string
}

type Skill = Omit<SpruceSchemas.Spruce.v2020_07_22.Skill, 'creators'>

export type CurrentSkill = Partial<Skill> & {
    name: string
    isRegistered: boolean
    namespacePascal: string
}

export type RegisteredSkill = Omit<
    SpruceSchemas.Spruce.v2020_07_22.Skill,
    'creators'
>

export type UpgradeMode =
    SpruceSchemas.SpruceCli.v2020_07_22.UpgradeSkillOptions['upgradeMode']

export interface FileDescription {
    path: string
    description: string
    shouldOverwriteWhenChanged: boolean
    confirmPromptOnFirstWrite?: string
}

export type InternalUpdateHandler = (message: string) => void

export type OptionOverrides = Record<string, Record<string, any>>

export type BlockedCommands = Record<string, string>

export interface HealthOptions {
    shouldRunOnSourceFiles?: boolean
}

export interface CliInterface extends MercuryEventEmitter<GlobalEventContract> {
    installFeatures: FeatureInstaller['install']
    getFeature: FeatureInstaller['getFeature']
    checkHealth(options?: HealthOptions): Promise<HealthCheckResults>
}

export interface CliBootOptions {
    cwd?: string
    homeDir?: string
    program?: CommanderStatic['program']
    graphicsInterface?: GraphicsInterface
    emitter?: GlobalEmitter
    apiClientFactory?: ApiClientFactory
    featureInstaller?: FeatureInstaller
    host?: string
}

export type PromiseCache = Record<string, Promise<ApiClient>>
