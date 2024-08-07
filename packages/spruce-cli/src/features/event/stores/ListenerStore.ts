import globby from '@sprucelabs/globby'
import { eventDiskUtil } from '@sprucelabs/spruce-event-utils'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { ListenerTemplateItem } from '@sprucelabs/spruce-templates'
import AbstractStore from '../../../stores/AbstractStore'

export type Listener = ListenerTemplateItem & {
    path: string
}

export default class ListenerStore extends AbstractStore {
    public name = 'listener'

    public async loadListeners() {
        const matches = await globby(this.generateGlobbyPattern())

        const listeners: Listener[] = []

        for (const match of matches) {
            const listener = eventDiskUtil.splitPathToListener(match)

            listeners.push({
                ...listener,
                path: match,
            })
        }

        return listeners
    }

    private generateGlobbyPattern(): string {
        return diskUtil.resolvePath(this.cwd, 'src', '**/*.listener.ts')
    }
}
