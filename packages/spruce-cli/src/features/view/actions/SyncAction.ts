import globby from '@sprucelabs/globby'
import { buildSchema, SchemaValues } from '@sprucelabs/schema'
import { diskUtil, namesUtil } from '@sprucelabs/spruce-skill-utils'
import {
    VcTemplateItem,
    ViewControllerPluginItem,
} from '@sprucelabs/spruce-templates'
import introspectionUtil, {
    IntrospectionClass,
} from '../../../utilities/introspection.utility'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'

export default class SyncAction extends AbstractAction<OptionsSchema> {
    public optionsSchema: OptionsSchema = optionsSchema
    public commandAliases = ['sync.views']
    public invocationMessage = 'Syncing view controller types... 🌲'

    public async execute(
        _options: SchemaValues<OptionsSchema>
    ): Promise<FeatureActionResponse> {
        const targetDir = diskUtil.resolvePath(this.cwd, 'src')
        const matches = await globby(
            ['**/*.svc.ts', '**/*.vc.ts', '**/*.view.plugin.ts'],
            {
                cwd: targetDir,
            }
        )

        if (matches.length === 0) {
            return {}
        }

        const paths = matches.map((m) => diskUtil.resolvePath(targetDir, m))
        const introspect = introspectionUtil.introspect(paths)

        const vcTemplateItems: VcTemplateItem[] = []
        const svcTemplateItems: VcTemplateItem[] = []
        const viewPluginItems: ViewControllerPluginItem[] = []

        introspect.forEach(({ classes }) => {
            for (const thisClass of classes) {
                const { vc, svc, plugin } =
                    this.mapIntrospectedClassToTemplateItem(thisClass)

                if (vc) {
                    vcTemplateItems.push(vc)
                } else if (plugin) {
                    viewPluginItems.push(plugin)
                } else if (svc) {
                    svcTemplateItems.push(svc)
                } else {
                    throw new Error('Unexpected class type.')
                }
            }
        })

        const namespace = await this.Store('skill').loadCurrentSkillsNamespace()
        const files = await this.Writer('view').writeCombinedViewsFile(
            this.cwd,
            {
                namespaceKebab: namesUtil.toKebab(namespace),
                vcTemplateItems,
                svcTemplateItems,
                viewPluginItems,
            }
        )

        return {
            files,
        }
    }

    private mapIntrospectedClassToTemplateItem(c: IntrospectionClass): {
        vc?: VcTemplateItem
        svc?: VcTemplateItem
        plugin?: ViewControllerPluginItem
    } {
        const item = {
            id: c.staticProperties.id,
            namePascal: c.className,
            path: c.classPath,
        }

        let vc: VcTemplateItem | undefined
        let svc: VcTemplateItem | undefined
        let plugin: ViewControllerPluginItem | undefined

        if (c.classPath.endsWith('.svc.ts')) {
            svc = item
        } else if (c.classPath.endsWith('view.plugin.ts')) {
            const nameCamel = c.classPath.match(/([^/]+).view.plugin.ts$/)![1]
            plugin = { ...item, nameCamel }
        } else {
            vc = item
        }

        return { svc, vc, plugin }
    }
}

const optionsSchema = buildSchema({
    id: 'syncViewsOptions',
    description: 'Keep types and generated files based on views in sync.',
    fields: {},
})

type OptionsSchema = typeof optionsSchema
