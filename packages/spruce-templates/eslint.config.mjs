import { buildEsLintConfig } from 'eslint-config-spruce'

const ignores = [
    'build/**',
    'node_modules/**',
    'mercury.min.*',
    'src/templates/**',
    '**/.spruce/**'
]

export default [
    { ignores },
    ...buildEsLintConfig({ ignores })
]
