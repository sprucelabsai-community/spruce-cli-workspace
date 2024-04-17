import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import {
    VcTemplateItem,
    ViewControllerPluginItem,
    ViewsOptions,
} from '../../../../../spruce-templates/build'
import SpruceError from '../../../errors/SpruceError'
import AbstractWriter from '../../../writers/AbstractWriter'

export default class ViewWriter extends AbstractWriter {
    public writeSkillViewController(
        cwd: string,
        options: {
            namePascal: string
            nameKebab: string
        }
    ) {
        const { path } = this.buildViewControllerPath(
            cwd,
            'skillView',
            options.namePascal
        )

        return this.writeController(path, { ...options, viewType: 'skillView' })
    }

    public async writeCombinedViewsFile(cwd: string, options: ViewsOptions) {
        let { vcTemplateItems, svcTemplateItems, viewPluginItems, ...rest } =
            options

        const destinationDir = diskUtil.resolveHashSprucePath(cwd, 'views')
        const destination = diskUtil.resolvePath(destinationDir, 'views.ts')

        vcTemplateItems = this.removeFileExtensionsFromTemplateItems(
            vcTemplateItems,
            destinationDir
        )

        svcTemplateItems = this.removeFileExtensionsFromTemplateItems(
            svcTemplateItems,
            destinationDir
        )

        viewPluginItems = this.removeFileExtensionsFromTemplateItems(
            viewPluginItems,
            destinationDir
        )

        const contents = this.templates.views({
            vcTemplateItems,
            svcTemplateItems,
            viewPluginItems,
            ...rest,
        })

        const results = await this.writeFileIfChangedMixinResults(
            destination,
            contents,
            'Used to export your controllers to Heartwood.'
        )

        return results
    }

    private removeFileExtensionsFromTemplateItems<
        T extends VcTemplateItem | ViewControllerPluginItem,
    >(vcTemplateItems: T[], destinationDir: string): T[] {
        return vcTemplateItems.map((i) => ({
            ...i,
            path: diskUtil
                .resolveRelativePath(destinationDir, i.path)
                .replace('.ts', ''),
        }))
    }

    public writeViewController(
        cwd: string,
        options: {
            viewType: string
            namePascal: string
            viewModel: string
            nameKebab: string
        }
    ) {
        const { path } = this.buildViewControllerPath(
            cwd,
            'view',
            options.namePascal
        )

        return this.writeController(path, options)
    }

    private async writeController(path: string, options: any) {
        const { namePascal, viewModel, viewType, nameKebab } = options

        if (diskUtil.doesFileExist(path)) {
            throw new SpruceError({
                code: 'SKILL_VIEW_EXISTS',
                name: namePascal,
            })
        }

        const contents =
            viewType === 'skillView'
                ? this.templates.skillViewController({ namePascal, nameKebab })
                : this.templates.viewController({
                      namePascal,
                      viewModel,
                      nameKebab,
                  })

        const results = this.writeFileIfChangedMixinResults(
            path,
            contents,
            'Test'
        )

        await this.lint(path)

        return results
    }

    public doesRootControllerExist(cwd: string) {
        const { path } = this.buildViewControllerPath(cwd, 'skillView', 'Root')
        return diskUtil.doesFileExist(path)
    }

    public async writeViewControllerPlugin(options: {
        cwd: string
        nameCamel: string
        namePascal: string
    }) {
        const { nameCamel, namePascal, cwd } = options

        const destination = diskUtil.resolvePath(
            cwd,
            'src',
            'viewPlugins',
            `${nameCamel}.view.plugin.ts`
        )

        const contents = this.templates.viewControllerPlugin({
            nameCamel,
            namePascal,
        })

        if (diskUtil.doesFileExist(destination)) {
            throw new SpruceError({
                code: 'VIEW_PLUGIN_ALREADY_EXISTS',
                name: nameCamel,
            })
        }

        return this.writeFileIfChangedMixinResults(
            destination,
            contents,
            `Your new view plugin!`
        )
    }

    public writePlugin(cwd: string) {
        const destination = diskUtil.resolveHashSprucePath(
            cwd,
            'features',
            'view.plugin.ts'
        )

        const pluginContents = this.templates.viewPlugin()

        const results = this.writeFileIfChangedMixinResults(
            destination,
            pluginContents,
            'Supports your skill with rendering views.'
        )

        return results
    }

    public writeTheme(cwd: string) {
        const destination = this.buildThemePath(cwd)

        const contents = this.templates.theme()

        const results = this.writeFileIfChangedMixinResults(
            destination,
            contents,
            'Your brand new theme file!'
        )

        return results
    }

    private buildThemePath(cwd: string) {
        return diskUtil.resolvePath(cwd, 'src', 'themes', 'skill.theme.ts')
    }

    public doesThemeFileExist(cwd: string) {
        const destination = this.buildThemePath(cwd)
        return diskUtil.doesFileExist(destination)
    }

    private buildViewControllerPath(
        cwd: string,
        viewType: 'skillView' | 'view',
        namePascal: string
    ) {
        const ext = viewType === 'skillView' ? '.svc.ts' : '.vc.ts'
        const filename = namePascal + ext
        const path = diskUtil.resolvePath(
            cwd,
            'src',
            viewType + 'Controllers',
            filename
        )
        return { path, filename }
    }
}
