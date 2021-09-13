const universalScripts = {
	'build.ci': 'yarn build.tsc && yarn build.resolve-paths && yarn lint',
	'build.dev': 'yarn build.tsc --sourceMap ; yarn resolve-paths.lint',
	'build.copy-files':
		"mkdir -p build && rsync -avzq --exclude='*.ts' ./src/ ./build/",
	'build.resolve-paths':
		"resolve-path-aliases --target build --patterns '**/*.js,**/*.d.ts'",
	'build.tsc': 'yarn build.copy-files && tsc',
	clean: 'yarn clean.build',
	'clean.all': 'yarn clean.dependencies && yarn clean.build',
	'clean.build': 'rm -rf build/',
	'clean.dependencies': 'rm -rf node_modules/ package-lock.json yarn.lock',
	'fix.lint': "eslint --fix --cache '**/*.ts'",
	lint: "eslint --cache '**/*.ts'",
	'lint.tsc': 'tsc -p . --noEmit',
	'post.watch.build': 'yarn build.copy-files && yarn build.resolve-paths',
	rebuild: 'yarn clean.all && yarn && yarn build.dev',
	'update.dependencies': 'yarn clean.dependencies && yarn',
	'resolve-paths.lint': 'yarn build.resolve-paths ; yarn lint',
	test: 'jest',
	'watch.build.dev':
		"tsc-watch --sourceMap --onCompilationComplete 'yarn post.watch.build'",
	'watch.lint':
		"concurrently 'yarn lint' \"chokidar 'src/**/*' -c 'yarn lint.tsc'\"",
	'watch.rebuild': 'yarn clean.all && yarn && yarn watch.build.dev',
	'watch.tsc': 'tsc -w',
}

export default universalScripts
