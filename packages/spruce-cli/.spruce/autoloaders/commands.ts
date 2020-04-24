// Import base class
import AbstractCommand from '../../src/commands/AbstractCommand'

// Import each matching class that will be autoloaded
import Autoloader from '../../src/commands/AutoloaderCommand'
import Error from '../../src/commands/ErrorCommand'
import Onboarding from '../../src/commands/OnboardingCommand'
import Remote from '../../src/commands/RemoteCommand'
import Schema from '../../src/commands/SchemaCommand'
import Skill from '../../src/commands/SkillCommand'
import Test from '../../src/commands/TestCommand'
import User from '../../src/commands/UserCommand'
import Watch from '../../src/commands/WatchCommand'

// Import necessary interface(s)
import { ICommandOptions } from '../../src/commands/AbstractCommand'

export interface ICommands {
	autoloader: Autoloader
	error: Error
	onboarding: Onboarding
	remote: Remote
	schema: Schema
	skill: Skill
	test: Test
	user: User
	watch: Watch
}

export default async function autoloader(options: {
	constructorOptions: ICommandOptions
	after?: (instance: AbstractCommand) => Promise<void>
}): Promise<ICommands> {
	const { constructorOptions, after } = options

	const autoloader = new Autoloader(constructorOptions)
	if (after) {
		await after(autoloader)
	}
	const error = new Error(constructorOptions)
	if (after) {
		await after(error)
	}
	const onboarding = new Onboarding(constructorOptions)
	if (after) {
		await after(onboarding)
	}
	const remote = new Remote(constructorOptions)
	if (after) {
		await after(remote)
	}
	const schema = new Schema(constructorOptions)
	if (after) {
		await after(schema)
	}
	const skill = new Skill(constructorOptions)
	if (after) {
		await after(skill)
	}
	const test = new Test(constructorOptions)
	if (after) {
		await after(test)
	}
	const user = new User(constructorOptions)
	if (after) {
		await after(user)
	}
	const watch = new Watch(constructorOptions)
	if (after) {
		await after(watch)
	}

	return {
		autoloader,
		error,
		onboarding,
		remote,
		schema,
		skill,
		test,
		user,
		watch
	}
}
