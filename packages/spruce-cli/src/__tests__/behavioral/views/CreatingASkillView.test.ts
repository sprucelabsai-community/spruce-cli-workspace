import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test'
import { errorAssertUtil } from '@sprucelabs/test-utils'
import CreateAction from '../../../features/view/actions/CreateAction'
import AbstractSkillTest from '../../../tests/AbstractSkillTest'
import testUtil from '../../../tests/utilities/test.utility'

export default class CreatingASkillViewTest extends AbstractSkillTest {
	protected static skillCacheKey = 'views'
	private static action: CreateAction
	private static rootSvc: string
	public static appointmentsCard: string
	private static dashboardVc: string

	protected static async beforeEach() {
		await super.beforeEach()
		this.action = this.Action('view', 'create') as CreateAction
	}

	@test()
	protected static hasCreateAction() {
		assert.isFunction(this.action.execute)
	}

	@test()
	protected static async asksIfRootSkillViewIfNotYetCreated() {
		void this.action.execute({
			viewType: 'skillView',
		})

		await this.waitForInput()

		const last = this.ui.lastInvocation()

		assert.isEqual(last.command, 'confirm')

		this.ui.reset()
	}

	@test()
	protected static async canCreateRootSkillView() {
		const results = await this.action.execute({
			viewType: 'skillView',
			isRoot: true,
		})

		assert.isFalsy(results.errors)

		this.rootSvc = testUtil.assertFileByNameInGeneratedFiles(
			'Root.svc.ts',
			results.files
		)

		assert.doesInclude(this.rootSvc, 'skillViewControllers')
	}

	@test()
	protected static async generatesValidRootSkillView() {
		await this.Service('typeChecker').check(this.rootSvc)
	}

	@test()
	protected static async rootSkillViewExtendsAbstractSkillViewController() {
		const contents = diskUtil.readFile(this.rootSvc)
		assert.doesInclude(
			contents,
			'export default class RootSkillViewController extends AbstractSkillViewController'
		)
	}

	@test()
	protected static async cantCreateTwoRootSvcs() {
		const results = await this.action.execute({
			viewType: 'skillView',
			isRoot: true,
		})

		assert.isTruthy(results.errors)

		errorAssertUtil.assertError(results.errors?.[0], 'SKILL_VIEW_EXISTS', {
			name: 'Root',
		})
	}

	@test()
	protected static async asksForNamesIfCreatingSkillViewNotRoot() {
		const promise = this.action.execute({
			viewType: 'skillView',
		})

		await this.waitForInput()

		let last = this.ui.lastInvocation()

		assert.isEqual(last.command, 'prompt')

		await this.ui.sendInput('Dashboard')
		await this.ui.sendInput('\n')

		const results = await promise

		assert.isFalsy(results.errors)

		this.dashboardVc = testUtil.assertFileByNameInGeneratedFiles(
			'Dashboard.svc.ts',
			results.files
		)

		assert.doesInclude(this.dashboardVc, 'skillViewControllers')

		this.ui.reset()
	}

	@test()
	protected static async asksForViewModelWhenCreatingSkillView() {
		const promise = this.action.execute({
			viewType: 'view',
			nameReadable: 'Appointments card',
		})

		await this.waitForInput()

		const last = this.ui.lastInvocation()

		assert.isEqual(last.command, 'prompt')
		assert.doesInclude(last.options.options.choices, {
			value: 'Card',
		})

		await this.ui.sendInput('Card')

		const results = await promise

		assert.isFalsy(results.errors)

		this.appointmentsCard = testUtil.assertFileByNameInGeneratedFiles(
			'AppointmentsCard.vc.ts',
			results.files
		)
	}

	@test()
	protected static skillViewExtendsAbstractViewControllerWithProperView() {
		const contents = diskUtil.readFile(this.appointmentsCard)
		assert.doesInclude(
			contents,
			'export default class AppointmentsCardViewController extends AbstractViewController<Card>'
		)
	}

	@test()
	protected static async nicelyTypesRootSkillViewController() {
		const contents = this.buildTestfile({
			idInterfaceName: 'SkillViewControllerId',
			code: `
const root = vcFactory.Controller('root', {})
export const svcModel = root.render()
export const svcId: SkillViewControllerId = 'root'`,
		})

		const testFile = this.resolvePath('src', 'test.ts')
		diskUtil.writeFile(testFile, contents)

		const imported = await this.Service('import').importAll(testFile)

		assert.isTruthy(imported.svcModel)
		assert.isTruthy(imported.svcId)
	}

	private static buildTestfile(options: {
		code: string
		idInterfaceName: 'SkillViewControllerId' | 'ViewControllerId'
	}) {
		const { code, idInterfaceName } = options

		return (
			`
import ` +
			`'#spruce/views/views'
import {
	ViewControllerFactory,
	${idInterfaceName},
} from '@sprucelabs/heartwood-view-controllers'
import { viewControllerUtil } from '@sprucelabs/spruce-view-plugin'

const vcFactory = ViewControllerFactory.Factory({
	controllerMap: viewControllerUtil.buildControllerMap(__dirname),
	connectToApi: async () => {
		return 'yes' as any
	},
})
${code}
		`.trim()
		)
	}

	@test()
	protected static async nicelyTypesViewController() {
		const contents = this.buildTestfile({
			idInterfaceName: 'ViewControllerId',
			code: `
		const apptCard = vcFactory.Controller('appointments-card', {})
		export const vcModel = apptCard.render()
		export const vcId: ViewControllerId = 'appointments-card'`,
		})

		const testFile = this.resolvePath('src', 'test.ts')
		diskUtil.writeFile(testFile, contents)

		const imported = await this.Service('import').importAll(testFile)

		assert.isTruthy(imported.vcModel)
		assert.isTruthy(imported.vcId)
	}
}
