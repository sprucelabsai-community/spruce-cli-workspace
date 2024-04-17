import globby from '@sprucelabs/globby'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import introspectionUtil from '../../utilities/introspection.utility'

export default class ParentTestFinder {
    private cwd: string

    public constructor(cwd: string) {
        this.cwd = cwd
    }

    public async findAbstractTests() {
        const matches = await globby([
            diskUtil.resolvePath(this.cwd, '**', 'Abstract*Test*.ts'),
            '!**/*.d.ts',
        ])

        const allDetails = introspectionUtil.introspect(matches)

        return matches
            .map((path, idx) => {
                const details = allDetails[idx]
                return {
                    path,
                    name: details.classes?.[0]?.className,
                    isDefaultExport: true,
                }
            })
            .filter((match) => !!match.name)
    }
}
