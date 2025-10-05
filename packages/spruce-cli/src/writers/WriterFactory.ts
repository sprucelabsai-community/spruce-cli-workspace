import { SettingsService } from '@sprucelabs/spruce-skill-utils'
import { Templates } from '@sprucelabs/spruce-templates'
import AgentWriter from '../features/agent/writers/AgentWriter'
import ConversationWriter from '../features/conversation/writers/ConversationWriter'
import DeployWriter from '../features/deploy/writers/DeployWriter'
import ErrorWriter from '../features/error/writers/ErrorWriter'
import EventWriter from '../features/event/writers/EventWriter'
import LogWriter from '../features/log/writers/LogWriter'
import NodeWriter from '../features/node/writers/NodeWriter'
import PermissionWriter from '../features/permission/writers/PermissionWriter'
import PolishWriter from '../features/polish/writers/PolishWriter'
import SandboxWriter from '../features/sandbox/writers/SandboxWriter'
import SchemaWriter from '../features/schema/writers/SchemaWriter'
import SkillGenerator from '../features/skill/writers/SkillWriter'
import StoreWriter from '../features/store/writers/StoreWriter'
import TestWriter from '../features/test/writers/TestWriter'
import ViewWriter from '../features/view/writers/ViewWriter'
import VsCodeWriter from '../features/vscode/writers/VsCodeWriter'
import LintService from '../services/LintService'
import { FileDescription } from '../types/cli.types'
import { GraphicsInterface } from '../types/cli.types'
import { WriterOptions } from './AbstractWriter'

const classMap = {
    error: ErrorWriter,
    event: EventWriter,
    schema: SchemaWriter,
    skill: SkillGenerator,
    test: TestWriter,
    agent: AgentWriter,
    node: NodeWriter,
    vscode: VsCodeWriter,
    conversation: ConversationWriter,
    deploy: DeployWriter,
    sandbox: SandboxWriter,
    store: StoreWriter,
    view: ViewWriter,
    log: LogWriter,
    polish: PolishWriter,
    permission: PermissionWriter,
}

export default class WriterFactory {
    private templates: Templates
    private ui: GraphicsInterface
    private linter?: LintService
    private settings: SettingsService<string>

    private static classMap = classMap

    public constructor(options: {
        templates: Templates
        ui: GraphicsInterface
        linter?: LintService
        settings: SettingsService
    }) {
        const { templates, ui, linter, settings } = options

        this.templates = templates
        this.ui = ui
        this.linter = linter
        this.settings = settings
    }

    public static reset() {
        this.classMap = classMap
    }

    public static setWriterClass(code: WriterCode, writer: any) {
        this.classMap[code] = writer
    }

    public Writer<C extends WriterCode>(
        code: C,
        options: Partial<WriterOptions> & {
            fileDescriptions: FileDescription[]
        }
    ): WriterMap[C] {
        const Class = WriterFactory.classMap[code]

        return new Class({
            templates: this.templates,
            term: this.ui,
            linter: this.linter,
            settings: this.settings,
            ...(options || {}),
        }) as WriterMap[C]
    }
}

export interface WriterMap {
    error: ErrorWriter
    event: EventWriter
    schema: SchemaWriter
    skill: SkillGenerator
    test: TestWriter
    node: NodeWriter
    vscode: VsCodeWriter
    conversation: ConversationWriter
    deploy: DeployWriter
    sandbox: SandboxWriter
    store: StoreWriter
    view: ViewWriter
    log: LogWriter
    polish: PolishWriter
    permission: PermissionWriter
    agent: AgentWriter
}

export type WriterCode = keyof WriterMap
