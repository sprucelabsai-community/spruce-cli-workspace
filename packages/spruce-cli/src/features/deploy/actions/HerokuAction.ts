import { buildSchema, SchemaValues } from '@sprucelabs/schema'
import { diskUtil, namesUtil, SkillAuth } from '@sprucelabs/spruce-skill-utils'
import SpruceError from '../../../errors/SpruceError'
import actionUtil from '../../../utilities/action.utility'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'

const optionsSchema = buildSchema({
    id: 'deployHeroku',
    description: 'Deploy your skill to Heroku.',
    fields: {
        teamName: {
            type: 'text',
            label: 'team name',
            isRequired: false,
        },
        shouldRunSilently: {
            type: 'boolean',
            isPrivate: true,
        },
        shouldBuildAndLint: {
            type: 'boolean',
            defaultValue: true,
        },
        shouldRunTests: {
            type: 'boolean',
            defaultValue: true,
        },
    },
})

type OptionsSchema = typeof optionsSchema
type Options = SchemaValues<OptionsSchema>

export default class DeployAction extends AbstractAction<OptionsSchema> {
    public optionsSchema = optionsSchema
    public commandAliases = ['deploy.heroku']
    public invocationMessage = 'Deploying to Heroku... 🚀'

    public async execute(options: Options): Promise<FeatureActionResponse> {
        let results: FeatureActionResponse = {}

        try {
            this.assertRegisteredSkill()
            await this.assertDependencies()
            await this.assertLoggedInToHeroku()
            await this.setupGitRepo()
            await this.setupGitRemote()

            const procResults = await this.setupProcFile()
            results = actionUtil.mergeActionResults(results, procResults)

            await this.assertNoPendingGitChanges()
        } catch (err: any) {
            return {
                errors: [err],
            }
        }

        const { shouldBuildAndLint, shouldRunTests } =
            this.validateAndNormalizeOptions(options)

        if (shouldBuildAndLint) {
            results = await this.buildAndLint()

            if (results.errors) {
                return results
            }
        }

        if (shouldRunTests) {
            results = await this.runTests()

            if (results.errors) {
                return results
            }
        }

        await this.deploy()

        this.ui.clear()

        const skill = this.Service('auth').getCurrentSkill() as SkillAuth

        results.summaryLines = [
            `You are good to go!`,
            "You gotta make sure that your ENV's are set on Heroku to the following:\n",
            `SKILL_NAME=${skill.name}`,
            `SKILL_SLUG=${skill.slug}`,
            `SKILL_ID=${skill.id}`,
            `SKILL_API_KEY=${skill.apiKey}`,
        ]

        return results
    }

    private assertRegisteredSkill() {
        const skill = this.Service('auth').getCurrentSkill()
        if (!skill) {
            throw new SpruceError({
                code: 'DEPLOY_FAILED',
                stage: 'skill',
                friendlyMessage:
                    'You have to register your skill. Try `spruce login && spruce register` to get going!',
            })
        }
    }

    private async deploy() {
        await this.Service('command').execute(
            'git push --set-upstream heroku master'
        )
    }

    private async assertNoPendingGitChanges() {
        const results = await this.Service('command').execute('git status')

        const failed =
            (results.stdout ?? '').toLowerCase().search('not staged') > -1 ||
            (results.stdout ?? '').toLowerCase().search('no commits') > -1

        if (failed) {
            throw new SpruceError({
                code: 'DEPLOY_FAILED',
                stage: 'git',
                friendlyMessage:
                    'You have pending changes. Commit them and try again!',
            })
        }
    }

    private async setupGitRemote() {
        const command = this.Service('command')

        try {
            await command.execute('git ls-remote heroku')

            return
        } catch {}

        const confirm = await this.ui.confirm(
            `I didn't find a a remote named "heroku", want me to create one?`
        )

        if (!confirm) {
            throw new SpruceError({
                code: 'DEPLOY_FAILED',
                stage: 'remote',
                friendlyMessage:
                    'You need to setup a remote named "heroku" that Heroku will pull from.',
            })
        }

        let pass = false
        let label =
            'What name do you wanna give your app on heroku (using-kebab-case)?'

        const pkg = this.Service('pkg')
        const skillName = pkg.get('name')

        do {
            let name = await this.ui.prompt({
                type: 'text',
                label,
                defaultValue: skillName,
                isRequired: true,
            })

            name = namesUtil.toKebab(name)

            try {
                await command.execute('heroku create', {
                    args: [name],
                    env: { HOME: process.env.HOME },
                })

                pass = true
            } catch {
                label = `Uh oh, "${name}" is taken, try again!`
            }
        } while (!pass)

        try {
            await command.execute('heroku buildpacks:set heroku/nodejs', {
                env: { HOME: process.env.HOME },
            })
        } catch {
            throw new SpruceError({ code: 'DEPLOY_FAILED', stage: 'remote' })
        }
    }

    private async setupProcFile(): Promise<FeatureActionResponse> {
        const procFile = diskUtil.resolvePath(this.cwd, 'Procfile')
        const results: FeatureActionResponse = {
            files: [],
        }
        if (!diskUtil.doesFileExist(procFile)) {
            const confirm = await this.ui.confirm(
                `I don't see a Procfile, which Heroku needs to know how to run your skill. Want me to create one?`
            )
            if (!confirm) {
                throw new SpruceError({
                    code: 'DEPLOY_FAILED',
                    stage: 'procfile',
                    friendlyMessage:
                        'You are gonna need to create a Procfile in your project root so heroku knows how to run your skill.',
                })
            }

            diskUtil.writeFile(procFile, 'worker: npm run boot')
            results.files?.push({
                name: 'Procfile',
                action: 'generated',
                path: procFile,
                description: 'Used by Heroku to know how to run your skill.',
            })
        }

        return results
    }

    private async setupGitRepo() {
        const command = this.Service('command')

        let inRepo = true
        try {
            await command.execute('git status')
        } catch {
            inRepo = false
        }

        if (!inRepo) {
            const confirm = await this.ui.confirm(
                'You are not in a git repo. Would you like to initialize one now?'
            )

            try {
                if (confirm) {
                    await command.execute('git init')
                    return
                }
            } catch {}

            throw new SpruceError({
                code: 'DEPLOY_FAILED',
                stage: 'git',
                friendlyMessage: 'You must be in a git repo to deploy!',
            })
        }
    }

    public async assertLoggedInToHeroku() {
        try {
            await this.Service('command').execute(
                'grep api.heroku.com ~/.netrc'
            )
        } catch {
            throw new SpruceError({
                code: 'DEPLOY_FAILED',
                stage: 'heroku',
                friendlyMessage: `You gotta be logged in using \`heroku login\` before you can deploy.!`,
            })
        }
    }

    private async assertDependencies() {
        const command = this.Service('command')
        const missing: { name: string; hint: string }[] = []

        try {
            await command.execute('which heroku')
        } catch {
            missing.push({
                name: 'heroku',
                hint: 'Follow install instructions @ https://devcenter.heroku.com/articles/heroku-cli#download-and-install',
            })
        }

        try {
            await command.execute('which git')
        } catch {
            missing.push({
                name: 'git',
                hint: 'Follow install instructions @ https://git-scm.com/downloads',
            })
        }

        if (missing.length > 0) {
            throw new SpruceError({
                code: 'MISSING_DEPENDENCIES',
                dependencies: missing,
            })
        }
    }

    private async runTests() {
        let results: FeatureActionResponse = {}

        const isTestInstalled = await this.features.isInstalled('test')

        if (isTestInstalled) {
            try {
                this.ui.startLoading(
                    'Testing your skill. Hold onto your pants. 👖'
                )

                const testResults = await this.Action('test', 'test').execute({
                    watchMode: 'off',
                    shouldReportWhileRunning: false,
                })

                results = actionUtil.mergeActionResults(results, testResults)
            } catch (err) {
                results = {
                    errors: [
                        new SpruceError({
                            code: 'DEPLOY_FAILED',
                            stage: 'testing',
                        }),
                    ],
                }
            }
        }
        return results
    }

    private async buildAndLint() {
        let results: FeatureActionResponse = {}

        const isSkillInstalled = await this.features.isInstalled('skill')

        if (isSkillInstalled) {
            try {
                this.ui.startLoading(
                    'Building your skill. This may take a minute...'
                )

                const buildResults = await this.Service('build').build({
                    shouldFixLintFirst: true,
                })

                results = actionUtil.mergeActionResults(results, buildResults)
            } catch (err) {
                results = {
                    errors: [
                        new SpruceError({
                            code: 'DEPLOY_FAILED',
                            stage: 'building',
                        }),
                    ],
                }
            }
        }
        return results
    }
}
