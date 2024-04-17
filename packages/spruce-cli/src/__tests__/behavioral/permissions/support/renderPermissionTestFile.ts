export default function renderPermissionTestFile(
    contractId: string,
    perm1?: string,
    perm2?: string
) {
    const parts = [
        `import '${'#' + 'spruce/permissions/permissions.types'}'
import { PermissionContractId${
            perm1 ? ', PermissionId' : ''
        } } from '@sprucelabs/mercury-types'

const contractId: PermissionContractId = '${contractId}'
console.log(contractId)`,
    ]

    if (perm1) {
        parts.push(`const perm1: PermissionId<'${contractId}'> = '${perm1}'
console.log(perm1)`)
    }

    if (perm2) {
        parts.push(`const perm2: PermissionId<'${contractId}'> = '${perm2}'
console.log(perm2)`)
    }

    return parts.join('\n')
}
