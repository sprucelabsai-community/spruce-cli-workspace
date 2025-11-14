import globby from '@sprucelabs/globby'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import {
    VcTemplateItem,
    ViewControllerPluginItem,
    ViewsOptions,
} from '@sprucelabs/spruce-templates'
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

    public async writeCombinedViewsFile(
        cwd: string,
        options: Omit<ViewsOptions, 'allTemplateItems'>
    ) {
        let {
            vcTemplateItems,
            svcTemplateItems,
            viewPluginItems,
            appTemplateItem,
            ...rest
        } = options

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

        if (appTemplateItem) {
            appTemplateItem = this.makePathRelative(
                appTemplateItem,
                destinationDir
            )
        }

        svcTemplateItems.sort((a, b) =>
            a.namePascal.localeCompare(b.namePascal)
        )

        vcTemplateItems.sort((a, b) => a.namePascal.localeCompare(b.namePascal))

        const allTemplateItems = [...vcTemplateItems, ...svcTemplateItems].sort(
            (a, b) => a.namePascal.localeCompare(b.namePascal)
        )

        const contents = this.templates.views({
            vcTemplateItems,
            svcTemplateItems,
            viewPluginItems,
            appTemplateItem,
            allTemplateItems,
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
        return vcTemplateItems.map((i) =>
            this.makePathRelative<T>(i, destinationDir)
        )
    }

    private makePathRelative<
        T extends VcTemplateItem | ViewControllerPluginItem,
    >(i: T, destinationDir: string): T & { path: string } {
        return {
            ...i,
            path: diskUtil
                .resolveRelativePath(destinationDir, i.path)
                .replace('.ts', ''),
        }
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
            'Your new view controller!'
        )

        return results
    }

    public async doesRootControllerExist(cwd: string) {
        const matches = await globby('**/Root.svc.ts', { cwd })
        return matches.length > 0
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
        debugger
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

    public async writeAppController(
        cwd: string,
        id: string,
        namespacePascal: string
    ) {
        const match = await globby(cwd + '/**/App.ac.ts')

        if (match.length > 0) {
            throw new SpruceError({
                code: 'APP_CONTROLLER_ALREADY_EXISTS',
            })
        }

        const destination = diskUtil.resolvePath(cwd, 'src', 'App.ac.ts')
        const contents = this.templates.appController({ id, namespacePascal })

        return this.writeFileIfChangedMixinResults(
            destination,
            contents,
            'Your new app view controller!'
        )
    }
}
