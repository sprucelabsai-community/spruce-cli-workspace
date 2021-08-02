import SyncAction from '../../features/view/actions/SyncAction'
import ViewWriter from '../../features/view/writers/ViewWriter'

export default class ViewFixture {
	private writer: ViewWriter
	private cwd: string
	private syncAction: SyncAction
	public constructor(
		cwd: string,
		viewWriter: ViewWriter,
		syncAction: SyncAction
	) {
		this.cwd = cwd
		this.writer = viewWriter
		this.syncAction = syncAction
	}

	public async createViewController(options: {
		namePascal: string
		nameKebab: string
	}) {
		const files = await this.writer.writeSkillViewController(this.cwd, options)

		await this.syncAction.execute({})

		return files[0]
	}
}
