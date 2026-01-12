# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## TDD - The 3 Laws (CRITICAL)

This is a strict TDD project following the 3 Laws of TDD:
1. Write a failing test first
2. Write only enough production code to make the test pass
3. Refactor, then repeat

**Small steps are key.** Write one failing test, make it pass, then write the next test. Test after each change.

## Testing (READ THIS FIRST)

### Tests Are Slow - Full Integration

Tests spin up actual skills (a special kind of node module) and node modules in a temp directory and run full integration tests against them. This is intentional but means tests take significant time.

### ALWAYS Run `yarn cache.tests` First

Before running tests, you must build the test cache:
```bash
cd packages/spruce-cli
yarn cache.tests        # Builds cached skill fixtures defined in package.json testSkillCache
```

The cache pre-generates skill/module fixtures so tests don't have to create them from scratch each time.

### ALWAYS Pattern Match on Test Files

Never run the full test suite during development. Always target specific test files:
```bash
cd packages/spruce-cli
yarn test -- --testPathPattern="CreatingViewControllers"    # Run specific test
yarn test -- --testPathPattern="stores"                      # Run tests matching pattern
```

### AbstractSkillTest - Shared Skill Across Tests (IMPORTANT)

Tests extending `AbstractSkillTest` share a single skill directory across all tests in the file:

```typescript
export default class MyTest extends AbstractSkillTest {
    protected static skillCacheKey = 'views'  // Must match key in package.json testSkillCache

    @test()
    protected static async firstTest() {
        // Creates something in the skill
    }

    @test()
    protected static async secondTest() {
        // Can rely on what firstTest created - tests ACCUMULATE state
    }
}
```

**Key implications:**
- The skill is created once in `beforeAll()` and reused across all tests
- Tests within a file are **not independent** - they build on each other
- Earlier tests must run before later tests because state accumulates
- This is intentional - setting up a skill for each test would be too slow
- When debugging, you may need to run the whole file, not just one test

### Test Base Classes

- `AbstractCliTest` - Base class with test utilities, creates fresh temp dirs each test
- `AbstractSkillTest` - Extends AbstractCliTest, creates ONE skill in `beforeAll()` and reuses it
- `AbstractSchemaTest`, `AbstractEventTest`, etc. - Feature-specific base classes

### Test Cache Keys

Defined in `packages/spruce-cli/package.json` under `testSkillCache`. Each key defines a pre-built skill configuration:
- `skills` - Basic skill
- `schemas` - Skill with schema feature
- `views` - Skill with view feature
- `events` - Skill with events
- `stores` - Skill with data stores
- `everything` - Skill with all features

## Commands

### Build
```bash
yarn build.dev          # Build both packages with sourcemaps
yarn build.ci           # CI build (tsc + types + resolve-paths + lint)
```

### Test
```bash
cd packages/spruce-cli
yarn cache.tests                                            # REQUIRED first
yarn test -- --testPathPattern="TestFileName"               # Run specific test
yarn watch.tests                                            # Watch mode
```

### Lint
```bash
yarn lint               # Lint all packages
yarn fix.lint           # Auto-fix lint issues
yarn lint.tsc           # Type-check without emitting
```

### Local Development
```bash
cd packages/spruce-cli
yarn local <command>    # e.g., yarn local user:login
```

## Project Overview

Spruce CLI is a monorepo (Yarn workspaces + Lerna) containing two packages:
- **`@sprucelabs/spruce-cli`** - Command-line interface for building Spruce skills
- **`@sprucelabs/spruce-templates`** - Handlebars-based template engine for code generation

## Architecture

### Feature System (Core Pattern)

The CLI uses a plugin-style feature architecture. Each feature in `packages/spruce-cli/src/features/` follows this structure:

```
FeatureNameFeature.ts    # Main feature class extending AbstractFeature
├── actions/             # Command implementations (e.g., CreateAction, BootAction)
├── stores/              # Data persistence (local or API)
├── writers/             # Code generation
└── updaters/            # Version/file update logic
```

**Key feature codes:** skill, schema, event, test, permission, view, deploy, store, error, conversation, node, vscode

### Action Pattern

Actions are commands within features. They:
- Extend `AbstractAction<S>` with an options schema
- Implement `execute(options)` returning `FeatureActionResponse`
- Are discovered dynamically from `*Action.js` files

### Service Layer

Services in `packages/spruce-cli/src/services/` provide utilities:
- **CommandService** - Shell command execution
- **PkgService** - package.json manipulation
- **LintService** - ESLint integration
- **ImportService** - Dynamic module loading
- **BuildService** - Compilation utilities

Access via: `this.Service('command')` in features/actions

### Template System

`packages/spruce-templates/src/` contains:
- **`templates/`** - Handlebars templates (typescript/, go/, directories/)
- **`addons/`** - Custom Handlebars helpers for schema/type generation

### Key Path Alias

The `#spruce/*` path alias resolves to generated files in `.spruce/` directories. Configured in tsconfig.json.

## Test File Locations

- `src/__tests__/behavioral/` - Full integration tests
- `src/__tests__/implementation/` - Feature-specific unit tests
- `src/tests/` - Test base classes and fixtures
- Tests build to `build/__tests__/` and run from there (not src)

## Code Generation Flow

1. Feature action calls `this.Writer('writerCode')`
2. Writer uses `this.templates` (from spruce-templates)
3. Templates compile Handlebars with addons
4. Writer handles file writing with lint formatting
