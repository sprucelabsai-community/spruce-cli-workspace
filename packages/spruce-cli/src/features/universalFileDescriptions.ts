import { FileDescription } from '../types/cli.types'

const universalFileDescriptions: FileDescription[] = [
    {
        path: 'eslint.config.mjs',
        description: 'Extends Spruce configurations.',
        shouldOverwriteWhenChanged: false,
    },
    {
        path: '.gitignore',
        description: 'The usual suspects.',
        shouldOverwriteWhenChanged: true,
    },
    {
        path: '.npmignore',
        description: 'Came out of nowhere!',
        shouldOverwriteWhenChanged: false,
    },
    {
        path: '.nvmrc',
        description: 'Keep node at the latest.',
        shouldOverwriteWhenChanged: true,
    },
    {
        path: 'readme.md',
        description: "Don't forget to update this at some point.",
        shouldOverwriteWhenChanged: false,
    },
    {
        path: 'package.json',
        description: 'All dependencies and scripts.',
        shouldOverwriteWhenChanged: false,
    },
    {
        path: 'tsconfig.json',
        description: 'Maps #spruce paths.',
        shouldOverwriteWhenChanged: true,
    },
    {
        path: '.spruce/settings.json',
        description: 'Tracks things like which features are installed.',
        shouldOverwriteWhenChanged: false,
    },
]

export default universalFileDescriptions
