import { buildPermissionContract } from '@sprucelabs/mercury-types'

const myFantasticallyAmazingEventListenPermissions = buildPermissionContract({
	id: 'myFantasticallyAmazingEventListenPermissions',
	name: 'my fantastically amazing event',
	description: undefined,
	requireAllPermissions: false,
	permissions: [
		{
			id: 'can-high-five',
			name: 'Can give high five',
			description: 'Will this person be allowed to high five?',
			/** 
              Uncomment this comment to set which roles will pass by default. Keep
              in mind this is overridden by the people who install your skill.

            defaultsByRoleBase: {
                guest: { onPrem: true },
                owner: { onPrem: true },
                groupManager: { onPrem: true },
                manager: { onPrem: true },
                teammate: { onPrem: true },
                anonymous: { default: false },
            },
            **/
			requireAllStatuses: false,
		},
	],
})

export default myFantasticallyAmazingEventListenPermissions
