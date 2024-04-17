import { PermissionContract } from '@sprucelabs/mercury-types'
import handlebars from 'handlebars'

handlebars.registerHelper(
    'permissionContractBuilder',
    function (permissionContract: PermissionContract) {
        return `buildPermissionContract(${JSON.stringify(
            permissionContract,
            null,
            2
        )})`
    }
)
