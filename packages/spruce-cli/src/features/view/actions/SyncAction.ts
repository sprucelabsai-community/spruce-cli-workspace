import { buildSchema, SchemaValues } from '@sprucelabs/schema'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import globby from 'globby'
import { VcTemplateItem } from '../../../../../spruce-templates/build'
import introspectionUtil, {
	IntrospectionClass,
} from '../../../utilities/introspection.utility'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'

const optionsSchema = buildSchema({
	id: 'syncViewsOptions',
	description: 'Keep types and generated files based on views in sync.',
	fields: {},
})

type OptionsSchema = typeof optionsSchema

export default class syncAction extends AbstractAction<OptionsSchema> {
	public code = 'sync'
	public optionsSchema: OptionsSchema = optionsSchema
	public commandAliases = ['sync.views']
	public invocationMessage = 'Syncing view controller types... 🌲'

	public async execute(
		_options: SchemaValues<OptionsSchema>
	): Promise<FeatureActionResponse> {
		const targetDir = diskUtil.resolvePath(this.cwd, 'src')
		const matches = await globby(['**/*.svc.ts', '**/*.vc.ts'], {
			cwd: targetDir,
		})

		if (matches.length === 0) {
			return {}
		}

		const paths = matches.map((m) => diskUtil.resolvePath(targetDir, m))
		const introspect = introspectionUtil.introspect(paths)

		const vcTemplateItems: VcTemplateItem[] = []
		const svcTemplateItems: VcTemplateItem[] = []

		introspect.forEach(({ classes }) => {
			for (const thisClass of classes) {
				const { vc, svc } = this.mapIntrospectedClassToTemplateItem(thisClass)

				if (vc) {
					vcTemplateItems.push(vc)
				} else if (svc) {
					svcTemplateItems.push(svc)
				}
			}
		})

		const files = await this.Writer('view').writeCombinedViewsFile(this.cwd, {
			vcTemplateItems,
			svcTemplateItems,
		})

		return {
			files,
		}
	}

	private mapIntrospectedClassToTemplateItem(c: IntrospectionClass): {
		vc?: VcTemplateItem
		svc?: VcTemplateItem
	} {
		const item = {
			id: c.staticProperties.id,
			namePascal: c.className,
			path: c.classPath,
		}

		let vc: VcTemplateItem | undefined
		let svc: VcTemplateItem | undefined

		if (c.classPath.endsWith('.svc.ts')) {
			svc = item
		} else {
			vc = item
		}

		return { svc, vc }
	}
}
