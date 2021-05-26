import { Templates } from '@sprucelabs/spruce-templates'
import ConversationWriter from '../features/conversation/writers/ConversationWriter'
import DeployWriter from '../features/deploy/writers/DeployWriter'
import ErrorWriter from '../features/error/writers/ErrorWriter'
import EventWriter from '../features/event/writers/EventWriter'
import NodeWriter from '../features/node/writers/NodeWriter'
import SandboxWriter from '../features/sandbox/writers/SandboxWriter'
import SchemaWriter from '../features/schema/writers/SchemaWriter'
import SkillGenerator from '../features/skill/writers/SkillWriter'
import StoreWriter from '../features/store/writers/StoreWriter'
import TestGenerator from '../features/test/writers/TestWriter'
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
	test: TestGenerator,
	node: NodeWriter,
	vscode: VsCodeWriter,
	conversation: ConversationWriter,
	deploy: DeployWriter,
	sandbox: SandboxWriter,
	store: StoreWriter,
	view: ViewWriter,
}

export interface WriterMap {
	error: ErrorWriter
	event: EventWriter
	schema: SchemaWriter
	skill: SkillGenerator
	test: TestGenerator
	node: NodeWriter
	vscode: VsCodeWriter
	conversation: ConversationWriter
	deploy: DeployWriter
	sandbox: SandboxWriter
	store: StoreWriter
	view: ViewWriter
}

export type WriterCode = keyof WriterMap

export default class WriterFactory {
	private templates: Templates
	private ui: GraphicsInterface
	private linter?: LintService

	public constructor(
		templates: Templates,
		ui: GraphicsInterface,
		linter?: LintService
	) {
		this.templates = templates
		this.ui = ui
		this.linter = linter
	}

	public Writer<C extends WriterCode>(
		code: C,
		options: Partial<WriterOptions> & { fileDescriptions: FileDescription[] }
	): WriterMap[C] {
		const Class = classMap[code]
		return new Class({
			templates: this.templates,
			term: this.ui,
			linter: this.linter,
			...(options || {}),
		}) as WriterMap[C]
	}
}
