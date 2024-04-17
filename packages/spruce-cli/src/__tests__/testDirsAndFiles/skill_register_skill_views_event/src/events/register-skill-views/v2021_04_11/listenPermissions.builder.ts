import { buildPermissionContract } from '@sprucelabs/mercury-types'

const registerSkillViewsListenPermissions = buildPermissionContract({
    id: 'registerSkillViewsListenPermissions',
    name: 'register skill views',
    description: undefined,
    requireAllPermissions: false,
    permissions: [],
})

export default registerSkillViewsListenPermissions
