import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import {
    StoreTemplateItem,
    StoreTemplateOptions,
} from '@sprucelabs/spruce-templates'
import SpruceError from '../../../errors/SpruceError'
import { GeneratedFile } from '../../../types/cli.types'
import AbstractWriter from '../../../writers/AbstractWriter'

export default class StoreWriter extends AbstractWriter {
    public async writeStore(
        destination: string,
        options: StoreTemplateOptions
    ) {
        const { namePascalPlural } = options

        const files: GeneratedFile[] = []

        const filename = `${namePascalPlural}.store.ts`

        const fileDest = diskUtil.resolvePath(
            destination,
            'src',
            'stores',
            filename
        )

        if (diskUtil.doesFileExist(fileDest)) {
            throw new SpruceError({ code: 'STORE_EXISTS' })
        }

        const contents = this.templates.store(options)

        diskUtil.writeFile(fileDest, contents)

        await this.lint(fileDest)

        files.push({
            action: 'generated',
            name: filename,
            path: fileDest,
        })

        return files
    }

    public writePlugin(cwd: string) {
        const destination = diskUtil.resolveHashSprucePath(
            cwd,
            'features',
            'store.plugin.ts'
        )

        const pluginContents = this.templates.storePlugin()

        const results = this.writeFileIfChangedMixinResults(
            destination,
            pluginContents,
            'Loads all your data stores and connects you to any databases you have configured.'
        )

        return results
    }

    public async writeTypesAndMap(
        destination: string,
        options: { stores: StoreTemplateItem[] }
    ) {
        const [types, map] = await Promise.all([
            this.writeTypes(destination, options),
            this.writeMap(destination, options),
        ])

        return [...types, ...map]
    }

    public async writeTypes(
        destination: string,
        options: { stores: StoreTemplateItem[] }
    ) {
        const file = diskUtil.resolvePath(destination, 'stores.types.ts')

        const typesContent = this.templates.storeTypes(options)

        const files = this.writeFileIfChangedMixinResults(
            file,
            typesContent,
            'The type merging for so the StoreFactory properly types you stores.'
        )

        await this.lint(file)

        return files
    }

    public async writeMap(
        destination: string,
        options: { stores: StoreTemplateItem[] }
    ) {
        const file = diskUtil.resolvePath(destination, 'stores.ts')
        const mapContent = this.templates.stores(options)

        const files = this.writeFileIfChangedMixinResults(
            file,
            mapContent,
            'A reference to all your data stores for easy inclusion.'
        )

        await this.lint(file)

        return files
    }
}
