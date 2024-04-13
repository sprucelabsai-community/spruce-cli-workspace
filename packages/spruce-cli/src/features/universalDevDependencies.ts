const universalDevDependencies = [
	{ name: '@sprucelabs/resolve-path-aliases', isDev: true },
	{ name: '@types/node', isDev: true },
	{ name: 'typescript', isDev: true },
	{ name: 'eslint', version: '^8.57.0', isDev: true },
	{ name: 'eslint-config-spruce', isDev: true },
	{ name: 'prettier', isDev: true },
	{ name: 'chokidar-cli', isDev: true },
	{ name: 'concurrently', isDev: true },
	{ name: 'tsc-watch', isDev: true },
	{ name: 'ts-node', isDev: true },
]

export default universalDevDependencies
