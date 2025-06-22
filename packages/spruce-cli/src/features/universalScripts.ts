const universalScripts = {
    build: 'yarn run build.tsc --sourceMap ; yarn run resolve-path-aliases',
    'build.ci':
        'yarn run build.tsc && yarn run build.resolve-paths && yarn run lint',
    'build.dev': 'yarn run build.tsc --sourceMap ; yarn run resolve-paths.lint',
    'build.copy-files':
        "mkdir -p build && rsync -avzq --exclude='*.ts' ./src/ ./build/",
    'build.resolve-paths':
        "resolve-path-aliases --target build --patterns '**/*.js,**/*.d.ts'",
    'build.tsc': 'yarn run build.copy-files && tsc',
    clean: 'yarn run clean.build',
    'clean.all': 'yarn run clean.dependencies && yarn run clean.build',
    'clean.build': 'rm -rf build/',
    'clean.dependencies': 'rm -rf node_modules/ package-lock.json yarn.lock',
    'fix.lint': "eslint --fix --cache '**/*.ts'",
    lint: "eslint --cache '**/*.ts'",
    'lint.tsc': 'tsc -p . --noEmit',
    'post.watch.build':
        'yarn run build.copy-files && yarn run build.resolve-paths',
    rebuild: 'yarn run clean.all && yarn install && yarn run build.dev',
    'update.dependencies': 'yarn run clean.dependencies && yarn',
    'resolve-paths.lint': 'yarn run build.resolve-paths ; yarn run lint',
    test: 'jest',
    'watch.build.dev':
        "tsc-watch --sourceMap --onCompilationComplete 'yarn run post.watch.build'",
    'watch.rebuild':
        'yarn run clean.all && yarn install && yarn run watch.build.dev',
    'watch.tsc': 'tsc -w',
}

export default universalScripts
