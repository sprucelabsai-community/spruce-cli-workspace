import { buildPermissionContract } from '@sprucelabs/mercury-types'

const registerSkillViewsEmitPermissions = buildPermissionContract({
    id: 'registerSkillViewsEmitPermissions',
    name: 'register skill views',
    description: undefined,
    requireAllPermissions: false,
    permissions: [],
})

export default registerSkillViewsEmitPermissions
