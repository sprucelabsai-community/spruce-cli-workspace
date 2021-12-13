import { SpruceSchemas } from '#spruce/schemas/schemas.types'
import {
	FeatureAction,
	FeatureActionResponse,
} from '../features/features.types'
import { GraphicsInterface as IGraphicsInterface } from './graphicsInterface.types'
export { NpmPackage } from '@sprucelabs/spruce-skill-utils'

export interface GraphicsInterface extends IGraphicsInterface {
	renderActionSummary(results: ExecutionResults & { totalTime?: number }): void
	getCursorPosition(): Promise<{ x: number; y: number } | null>
	moveCursorTo(x: number, y: number): void
	clearBelowCursor(): void
	clear(): void
	waitForEnter(message?: string): Promise<void>
	sendInput(message: string): Promise<void>
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

export type FileDescription = {
	path: string
	description: string
	shouldOverwriteWhenChanged: boolean
	confirmPromptOnFirstWrite?: string
}

export type InternalUpdateHandler = (message: string) => void

export interface OptionOverrides {
	[command: string]: Record<string, any>
}

export interface BlockedCommands {
	[command: string]: string
}
