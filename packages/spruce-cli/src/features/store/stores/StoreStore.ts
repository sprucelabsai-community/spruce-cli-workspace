import globby from '@sprucelabs/globby'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import SpruceError from '../../../errors/SpruceError'
import AbstractStore from '../../../stores/AbstractStore'
import introspectionUtil from '../../../utilities/introspection.utility'

export interface LoadedStore {
    className: string
    path: string
}

export default class StoreStore extends AbstractStore {
    public name = 'store'

    public async fetchStores() {
        const search = this.generateGlobbyPattern()
        const matches = await globby(search)

        const results = introspectionUtil.introspect(matches)

        const stores: LoadedStore[] = []

        for (let i = 0; i < results.length; i++) {
            const introspect = results[i]
            const className = introspect.classes[0]?.className
            if (!className) {
                throw new SpruceError({
                    code: 'FAILED_TO_IMPORT',
                    file: matches[i],
                })
            }

            stores.push({ className, path: matches[i] })
        }

        return stores
    }

    private generateGlobbyPattern() {
        return diskUtil.resolvePath(this.cwd, 'src', '**', '*.store.ts')
    }
}
