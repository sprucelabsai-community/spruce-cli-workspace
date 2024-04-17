import { START_DIVIDER, END_DIVIDER } from '@sprucelabs/jest-json-reporter'
import AbstractSpruceTest, { test, assert } from '@sprucelabs/test-utils'
import JestJsonParser, { JsonResultKeys } from '../../tests/JestJsonParser'
import onTestFileResult from '../support/onTestFileResult'
export default class JestJsonParserTest extends AbstractSpruceTest {
    private static parser: JestJsonParser

    protected static async beforeEach() {
        await super.beforeEach()
        this.parser = new JestJsonParser()
    }

    @test()
    protected static canCreateJjp() {
        assert.isTruthy(this.parser.write)
    }

    @test()
    protected static generatesEmptyResults() {
        const startRun = this.generateTestResults('onRunStart')

        this.parser.write(startRun)

        const testResults = this.parser.getResults()

        assert.isEqualDeep(testResults, {
            totalTestFiles: 43,
        })
    }

    @test()
    protected static canHandleSelfContainedWrite() {
        const data = this.generateTestResults(
            'onTestFileStart',
            'behavioral/errors/CreatingANewErrorBuilder.test.js'
        )

        this.parser.write(this.generateTestResults('onRunStart'))
        this.parser.write(data)

        const testResults = this.parser.getResults()
        assert.isTruthy(testResults.testFiles)

        assert.isLength(testResults.testFiles, 1)
        assert.isEqualDeep(testResults.testFiles[0], {
            path: `behavioral/errors/CreatingANewErrorBuilder.test.ts`,
            status: 'running',
        })
    }

    private static generateTestResults(
        jestStatus: JsonResultKeys,
        testFile?: string
    ): string {
        switch (jestStatus) {
            case 'onRunStart':
                return `${START_DIVIDER}{"status":"onRunStart","results":{"numFailedTestSuites":0,"numFailedTests":0,"numPassedTestSuites":0,"numPassedTests":0,"numPendingTestSuites":0,"numPendingTests":0,"numRuntimeErrorTestSuites":0,"numTodoTests":0,"numTotalTestSuites":43,"numTotalTests":0,"openHandles":[],"snapshot":{"added":0,"didUpdate":false,"failure":false,"filesAdded":0,"filesRemoved":0,"filesRemovedList":[],"filesUnmatched":0,"filesUpdated":0,"matched":0,"total":0,"unchecked":0,"uncheckedKeysByFile":[],"unmatched":0,"updated":0},"startTime":1603459399575,"success":false,"testResults":[],"wasInterrupted":false}}${END_DIVIDER}`
            case 'onTestFileStart':
                return `${START_DIVIDER}{"status":"onTestFileStart","test":{"context":{"config":{"automock":false,"cache":true,"cacheDirectory":"/private/var/folders/qw/v2bfr0c94bn37vclwvcltsj40000gn/T/jest_dx","clearMocks":false,"coveragePathIgnorePatterns":["/node_modules/"],"cwd":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli","detectLeaks":false,"detectOpenHandles":false,"errorOnDeprecated":false,"extraGlobals":[],"forceCoverageMatch":[],"globals":{},"haste":{"computeSha1":false,"throwOnModuleCollision":false},"injectGlobals":true,"moduleDirectories":["node_modules"],"moduleFileExtensions":["js","json","jsx","ts","tsx","node"],"moduleNameMapper":[["^#spruce/schemas/fields/(.*)","/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli/node_modules/@sprucelabs/schema/build/.spruce/schemas/fields/$1"],["^#spruce/(.*)$","/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli/build/.spruce/$1"]],"modulePathIgnorePatterns":[],"name":"44406c6bd09f4805a9dd2ad1a17b150c","prettierPath":"prettier","resetMocks":false,"resetModules":false,"restoreMocks":false,"rootDir":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli","roots":["/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli"],"runner":"jest-runner","setupFiles":[],"setupFilesAfterEnv":[],"skipFilter":false,"slowTestThreshold":5,"snapshotSerializers":[],"testEnvironment":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/node_modules/jest-environment-node/build/index.js","testEnvironmentOptions":{},"testLocationInResults":false,"testMatch":["**/__tests__/**/*.test.js?(x)"],"testPathIgnorePatterns":["/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli/tmp/","/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli/src/","/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli/node_modules/","/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli/build/__tests__/testDirsAndFiles/"],"testRegex":[],"testRunner":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/node_modules/jest-jasmine2/build/index.js","testURL":"http://localhost","timers":"real","transform":[[".[jt]sx?$","/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/node_modules/babel-jest/build/index.js",{}]],"transformIgnorePatterns":["/node_modules/",".pnp.[^/]+$"],"watchPathIgnorePatterns":["/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli/src/"]},"hasteFS":{"_rootDir":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli","_files":{}},"moduleMap":{"duplicates":[],"map":[["@sprucelabs/spruce-cli",{"g":["package.json",1]}]],"mocks":[],"rootDir":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli"},"resolver":{"_options":{"extensions":[".js",".json",".jsx",".ts",".tsx",".node"],"hasCoreModules":true,"moduleDirectories":["node_modules"],"moduleNameMapper":[{"moduleName":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli/node_modules/@sprucelabs/schema/build/.spruce/schemas/fields/$1","regex":{}},{"moduleName":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli/build/.spruce/$1","regex":{}}],"rootDir":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli"},"_moduleMap":{"duplicates":[],"map":[["@sprucelabs/spruce-cli",{"g":["package.json",1]}]],"mocks":[],"rootDir":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli"},"_moduleIDCache":{},"_moduleNameCache":{},"_modulePathCache":{},"_supportsNativePlatform":false}},"duration":40472,"path":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli/build/__tests__/${testFile}"}}${END_DIVIDER}`
            case 'onTestFileResult':
                return `${START_DIVIDER}${JSON.stringify(
                    onTestFileResult(testFile ?? 'missing')
                )}${END_DIVIDER}`
            default:
                throw new Error('Status not implemented')
        }
    }

    @test()
    protected static canHandleSelfContainedWriteWithTwoTests() {
        const data =
            this.generateTestResults(
                'onTestFileStart',
                'behavioral/errors/CreatingANewErrorBuilder.test.js'
            ) +
            this.generateTestResults(
                'onTestFileStart',
                'behavioral/tests/RunningTests.test.js'
            )
        this.parser.write(data)

        const testResults = this.parser.getResults()

        assert.isTruthy(testResults.testFiles)
        assert.isLength(testResults.testFiles, 2)
        assert.isEqualDeep(testResults.testFiles, [
            {
                path: `behavioral/errors/CreatingANewErrorBuilder.test.ts`,
                status: 'running',
            },
            {
                path: `behavioral/tests/RunningTests.test.ts`,
                status: 'running',
            },
        ])
    }

    @test()
    protected static multipleSelfContainedWritesWorks() {
        this.parser.write(
            this.generateTestResults(
                'onTestFileStart',
                `behavioral/errors/CreatingANewErrorBuilder.test.js`
            )
        )

        this.parser.write(
            this.generateTestResults(
                'onTestFileStart',
                `behavioral/tests/RunningTests.test.js`
            )
        )
        const testResults = this.parser.getResults()

        assert.isTruthy(testResults.testFiles)
        assert.isLength(testResults.testFiles, 2)
        assert.isEqualDeep(testResults.testFiles, [
            {
                path: `behavioral/errors/CreatingANewErrorBuilder.test.ts`,
                status: 'running',
            },
            {
                path: `behavioral/tests/RunningTests.test.ts`,
                status: 'running',
            },
        ])
    }

    @test()
    protected static partialWriteReturnsNothing() {
        const data = this.generateTestResults(
            'onTestFileStart',
            'behavioral/errors/KeepingErrorsInSync.test.js'
        ).substr(0, 100)

        this.parser.write(data)

        const testResults = this.parser.getResults()
        assert.isFalsy(testResults.testFiles)
    }

    @test()
    protected static canPartialWriteAcrossTwoWrites() {
        const data = this.generateTestResults(
            'onTestFileStart',
            'behavioral/errors/KeepingErrorsInSync.test.js'
        )

        const firstPart = data.substr(0, 100)
        const secondPart = data.substr(100)

        this.parser.write(firstPart)
        this.parser.write(secondPart)

        const testResults = this.parser.getResults()

        assert.isTruthy(testResults.testFiles)
        assert.isLength(testResults.testFiles, 1)

        assert.isEqualDeep(testResults.testFiles[0], {
            path: `behavioral/errors/KeepingErrorsInSync.test.ts`,
            status: 'running',
        })
    }

    @test()
    protected static canPartialWriteAndSelfContainedAcrossThreeWrites() {
        const data = this.generateTestResults(
            'onTestFileStart',
            'behavioral/errors/KeepingErrorsInSync.test.js'
        )

        const firstPart = data.substr(0, 100)
        const secondPart = data.substr(100)

        this.parser.write(this.generateTestResults('onRunStart'))
        this.parser.write(firstPart)
        this.parser.write(secondPart)
        this.parser.write(
            this.generateTestResults(
                'onTestFileStart',
                'behavioral/tests/CreatingANewErrorBuilder.test.js'
            )
        )

        const testResults = this.parser.getResults()

        assert.isEqualDeep(testResults, {
            totalTestFiles: 43,
            testFiles: [
                {
                    path: 'behavioral/errors/KeepingErrorsInSync.test.ts',
                    status: 'running',
                },
                {
                    path: 'behavioral/tests/CreatingANewErrorBuilder.test.ts',
                    status: 'running',
                },
            ],
        })
    }

    @test()
    protected static canSelfContainedPlusPartial() {
        const firstSelfContained = this.generateTestResults(
            'onTestFileStart',
            `behavioral/errors/KeepingErrorsInSync.test.js`
        )
        const data =
            firstSelfContained +
            this.generateTestResults(
                'onTestFileStart',
                'behavioral/tests/CreatingANewErrorBuilder.test.js'
            )

        const splitIdx = firstSelfContained.length + 500
        const firstPart = data.substr(0, splitIdx)
        const secondPart = data.substr(splitIdx)

        this.parser.write(firstPart)
        this.parser.write(secondPart)

        const testResults = this.parser.getResults()
        assert.isTruthy(testResults.testFiles)
        assert.isLength(testResults.testFiles, 2)

        assert.isEqualDeep(testResults.testFiles[0], {
            path: `behavioral/errors/KeepingErrorsInSync.test.ts`,
            status: 'running',
        })

        assert.isEqualDeep(testResults.testFiles[1], {
            path: 'behavioral/tests/CreatingANewErrorBuilder.test.ts',
            status: 'running',
        })
    }

    @test()
    protected static canHandleGarbageAtFrontOfData() {
        const data =
            'yarn test run\nother garbage' +
            this.generateTestResults(
                'onTestFileStart',
                'behavioral/errors/CreatingANewErrorBuilder.test.js'
            )
        this.parser.write(data)

        const testResults = this.parser.getResults()

        assert.isTruthy(testResults.testFiles)
        assert.isLength(testResults.testFiles, 1)
        assert.isEqualDeep(testResults.testFiles[0], {
            path: `behavioral/errors/CreatingANewErrorBuilder.test.ts`,
            status: 'running',
        })
    }

    @test()
    protected static canHandlesSplitTestRestsWithGarbageInFrontAndDanglingEnd() {
        this.parser.write(
            'yarn run go team ***************************START_JSON_DIVIDER***************************'
        )
        this.parser.write(
            '{"status":"onTestFileStart","test":{"context":{"config":{"automock":false,"cache":true,"cacheDirectory":"/private/tmp/jest_dx","clearMocks":false,"coveragePathIgnorePatterns":["/node_modules/"],"cwd":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli","detectLeaks":false,"detectOpenHandles":false,"errorOnDeprecated":false,"extraGlobals":[],"forceCoverageMatch":[],"globals":{},"haste":{"computeSha1":false,"throwOnModuleCollision":false},"injectGlobals":true,"moduleDirectories":["node_modules"],"moduleFileExtensions":["js","json","jsx","ts","tsx","node"],"moduleNameMapper":[["^#spruce/schemas/fields/(.*)","/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli/node_modules/@sprucelabs/schema/build/.spruce/schemas/fields/$1"],["^#spruce/(.*)$","/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli/build/.spruce/$1"]],"modulePathIgnorePatterns":[],"name":"44406c6bd09f4805a9dd2ad1a17b150c","prettierPath":"prettier","resetMocks":false,"resetModules":false,"restoreMocks":false,"rootDir":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli","roots":["/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli"],"runner":"jest-runner","setupFiles":[],"setupFilesAfterEnv":[],"skipFilter":false,"slowTestThreshold":5,"snapshotSerializers":[],"testEnvironment":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/node_modules/jest-environment-node/build/index.js","testEnvironmentOptions":{},"testLocationInResults":false,"testMatch":["**/__tests__/**/*.test.js?(x)"],"testPathIgnorePatterns":["/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli/tmp/","/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli/src/","/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli/node_modules/","/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli/build/__tests__/testDirsAndFiles/"],"testRegex":[],"testRunner":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/node_modules/jest-jasmine2/build/index.js","testURL":"http://localhost","timers":"real","transform":[[".[jt]sx?$","/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/node_modules/babel-jest/build/index.js",{}]],"transformIgnorePatterns":["/node_modules/",".pnp.[^/]+$"],"watchPathIgnorePatterns":["/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli/src/"]},"hasteFS":{"_rootDir":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli","_files":{}},"moduleMap":{"duplicates":[],"map":[["@sprucelabs/spruce-cli",{"g":["package.json",1]}]],"mocks":[],"rootDir":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli"},"resolver":{"_options":{"extensions":[".js",".json",".jsx",".ts",".tsx",".node"],"hasCoreModules":true,"moduleDirectories":["node_modules"],"moduleNameMapper":[{"moduleName":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli/node_modules/@sprucelabs/schema/build/.spruce/schemas/fields/$1","regex":{}},{"moduleName":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli/build/.spruce/$1","regex":{}}],"rootDir":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli"},"_moduleMap":{"duplicates":[],"map":[["@sprucelabs/spruce-cli",{"g":["package.json",1]}]],"mocks":[],"rootDir":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli"},"_moduleIDCache":{},"_moduleNameCache":{},"_modulePathCache":{},"_supportsNativePlatform":false}},"duration":50540,"path":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli/build/__tests__/behavioral/tests/RunningTests.test.js"}}'
        )

        this.parser
            .write(`***************************END_JSON_DIVIDER***************************
			***************************START_JSON_DIVIDER***************************
			{"status":"onTestFileStart","test":{"context":{"config":{"automock":false,"cache":true,"cacheDirectory":"/private/tmp/jest_dx","clearMocks":false,"coveragePathIgnorePatterns":["/node_modules/"],"cwd":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli","detectLeaks":false,"detectOpenHandles":false,"errorOnDeprecated":false,"extraGlobals":[],"forceCoverageMatch":[],"globals":{},"haste":{"computeSha1":false,"throwOnModuleCollision":false},"injectGlobals":true,"moduleDirectories":["node_modules"],"moduleFileExtensions":["js","json","jsx","ts","tsx","node"],"moduleNameMapper":[["^#spruce/schemas/fields/(.*)","/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli/node_modules/@sprucelabs/schema/build/.spruce/schemas/fields/$1"],["^#spruce/(.*)$","/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli/build/.spruce/$1"]],"modulePathIgnorePatterns":[],"name":"44406c6bd09f4805a9dd2ad1a17b150c","prettierPath":"prettier","resetMocks":false,"resetModules":false,"restoreMocks":false,"rootDir":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli","roots":["/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli"],"runner":"jest-runner","setupFiles":[],"setupFilesAfterEnv":[],"skipFilter":false,"slowTestThreshold":5,"snapshotSerializers":[],"testEnvironment":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/node_modules/jest-environment-node/build/index.js","testEnvironmentOptions":{},"testLocationInResults":false,"testMatch":["**/__tests__/**/*.test.js?(x)"],"testPathIgnorePatterns":["/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli/tmp/","/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli/src/","/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli/node_modules/","/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli/build/__tests__/testDirsAndFiles/"],"testRegex":[],"testRunner":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/node_modules/jest-jasmine2/build/index.js","testURL":"http://localhost","timers":"real","transform":[["\.[jt]sx?$","/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/node_modules/babel-jest/build/index.js",{}]],"transformIgnorePatterns":["/node_modules/","\.pnp\.[^\/]+$"],"watchPathIgnorePatterns":["/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli/src/"]},"hasteFS":{"_rootDir":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli","_files":{}},"moduleMap":{"duplicates":[],"map":[["@sprucelabs/spruce-cli",{"g":["package.json",1]}]],"mocks":[],"rootDir":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli"},"resolver":{"_options":{"extensions":[".js",".json",".jsx",".ts",".tsx",".node"],"hasCoreModules":true,"moduleDirectories":["node_modules"],"moduleNameMapper":[{"moduleName":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli/node_modules/@sprucelabs/schema/build/.spruce/schemas/fields/$1","regex":{}},{"moduleName":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli/build/.spruce/$1","regex":{}}],"rootDir":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli"},"_moduleMap":{"duplicates":[],"map":[["@sprucelabs/spruce-cli",{"g":["package.json",1]}]],"mocks":[],"rootDir":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli"},"_moduleIDCache":{},"_moduleNameCache":{},"_modulePathCache":{},"_supportsNativePlatform":false}},"duration":48733,"path":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli/build/__tests__/behavioral/errors/CreatingANewErrorBuilder.test.js"}}
			***************************END_JSON_DIVIDER***************************
			***************************START_JSON_DIVIDER***************************
			{"status":"onTestFileStart","test":{"context":{"config":{"automock":false,"cache":true,"cacheDirectory":"/private/tmp/jest_dx","clearMocks":false,"coveragePathIgnorePatterns":["/node_modules/"],"cwd":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli","detectLeaks":false,"detectOpenHandles":false,"errorOnDeprecated":false,"extraGlobals":[],"forceCoverageMatch":[],"globals":{},"haste":{"computeSha1":false,"throwOnModuleCollision":false},"injectGlobals":true,"moduleDirectories":["node_modules"],"moduleFileExtensions":["js","json","jsx","ts","tsx","node"],"moduleNameMapper":[["^#spruce/schemas/fields/(.*)","/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli/node_modules/@sprucelabs/schema/build/.spruce/schemas/fields/$1"],["^#spruce/(.*)$","/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli/build/.spruce/$1"]],"modulePathIgnorePatterns":[],"name":"44406c6bd09f4805a9dd2ad1a17b150c","prettierPath":"prettier","resetMocks":false,"resetModules":false,"restoreMocks":false,"rootDir":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli","roots":["/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli"],"runner":"jest-runner","setupFiles":[],"setupFilesAfterEnv":[],"skipFilter":false,"slowTestThreshold":5,"snapshotSerializers":[],"testEnvironment":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/node_modules/jest-environment-node/build/index.js","testEnvironmentOptions":{},"testLocationInResults":false,"testMatch":["**/__tests__/**/*.test.js?(x)"],"testPathIgnorePatterns":["/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli/tmp/","/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli/src/","/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli/node_modules/","/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli/build/__tests__/testDirsAndFiles/"],"testRegex":[],"testRunner":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/node_modules/jest-jasmine2/build/index.js","testURL":"http://localhost","timers":"real","transform":[["\.[jt]sx?$","/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/node_modules/babel-jest/build/index.js",{}]],"transformIgnorePatterns":["/node_modules/","\.pnp\.[^\/]+$"],"watchPathIgnorePatterns":["/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli/src/"]},"hasteFS":{"_rootDir":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli","_files":{}},"moduleMap":{"duplicates":[],"map":[["@sprucelabs/spruce-cli",{"g":["package.json",1]}]],"mocks":[],"rootDir":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli"},"resolver":{"_options":{"extensions":[".js",".json",".jsx",".ts",".tsx",".node"],"hasCoreModules":true,"moduleDirectories":["node_modules"],"moduleNameMapper":[{"moduleName":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli/node_modules/@sprucelabs/schema/build/.spruce/schemas/fields/$1","regex":{}},{"moduleName":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli/build/.spruce/$1","regex":{}}],"rootDir":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli"},"_moduleMap":{"duplicates":[],"map":[["@sprucelabs/spruce-cli",{"g":["package.json",1]}]],"mocks":[],"rootDir":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli"},"_moduleIDCache":{},"_moduleNameCache":{},"_modulePathCache":{},"_supportsNativePlatform":false}},"duration":17443,"path":"/Users/taylorromero/Development/SpruceLabs/spruce-cli-workspace/packages/spruce-cli/build/__tests__/behavioral/watchers/WatchingForChanges.test.js"}}`)

        const testResults = this.parser.getResults()

        assert.isTruthy(testResults.testFiles)
        assert.isLength(testResults.testFiles, 2)
    }

    @test()
    protected static canUpdateAsTestsCompletes() {
        const data = this.generateTestResults(
            'onTestFileStart',
            'behavioral/errors/CreatingANewErrorBuilder.test.js'
        )

        this.parser.write(data)

        const completed = this.generateTestResults(
            'onTestFileResult',
            'behavioral/errors/CreatingANewErrorBuilder.test.js'
        )

        this.parser.write(completed)

        const testResults = this.parser.getResults()

        assert.isTruthy(testResults.testFiles)
        assert.isLength(testResults.testFiles, 11)

        assert.isEqualDeep(testResults, {
            totalTestFiles: 39,
            testFiles: [
                {
                    path: 'behavioral/errors/CreatingANewErrorBuilder.test.ts',
                    status: 'running',
                },
                {
                    path: 'implementation/CasualNameUtility.test.ts',
                    status: 'passed',
                    tests: [
                        {
                            name: 'No name returns friend',
                            status: 'passed',
                            errorMessages: [],
                            duration: 2,
                        },
                        {
                            name: 'Just last name to just last name',
                            status: 'passed',
                            errorMessages: [],
                            duration: 0,
                        },
                        {
                            name: 'First name only to first name only',
                            status: 'passed',
                            errorMessages: [],
                            duration: 1,
                        },
                        {
                            name: 'last and first name to First Last initial',
                            status: 'passed',
                            errorMessages: [],
                            duration: 0,
                        },
                    ],
                },
                {
                    path: 'implementation/PhoneUtility.test.ts',
                    status: 'passed',
                    tests: [
                        {
                            name: 'canMatchDummyNumber',
                            status: 'passed',
                            errorMessages: [],
                            duration: 1,
                        },
                    ],
                },
                {
                    path: 'implementation/TokenUtility.test.ts',
                    status: 'passed',
                    tests: [
                        {
                            name: 'exists',
                            status: 'passed',
                            errorMessages: [],
                            duration: 0,
                        },
                        {
                            name: 'canGenerateTokenForPerson',
                            status: 'passed',
                            errorMessages: [],
                            duration: 10,
                        },
                        {
                            name: 'generatesValidToken',
                            status: 'passed',
                            errorMessages: [],
                            duration: 1,
                        },
                        {
                            name: 'decodesAndVerifiesValidToken',
                            status: 'passed',
                            errorMessages: [],
                            duration: 1,
                        },
                        {
                            name: 'decodesValidToken',
                            status: 'passed',
                            errorMessages: [],
                            duration: 1,
                        },
                        {
                            name: 'verifyFailsOnBadSecret',
                            status: 'passed',
                            errorMessages: [],
                            duration: 17,
                        },
                    ],
                },
                {
                    path: 'implementation/RoleStore.test.ts',
                    status: 'passed',
                    tests: [
                        {
                            name: 'canCreateOrgStore',
                            status: 'passed',
                            errorMessages: [],
                            duration: 4,
                        },
                        {
                            name: 'canGenerateBaseRoles',
                            status: 'passed',
                            errorMessages: [],
                            duration: 80,
                        },
                    ],
                },
                {
                    path: 'implementation/PersonRoleStore.test.ts',
                    status: 'passed',
                    tests: [
                        {
                            name: 'personRole',
                            status: 'passed',
                            errorMessages: [],
                            duration: 6,
                        },
                        {
                            name: 'canGivePersonGlobalRole',
                            status: 'passed',
                            errorMessages: [],
                            duration: 88,
                        },
                        {
                            name: 'canGiveRoleAndThenTakeItAway',
                            status: 'passed',
                            errorMessages: [],
                            duration: 25,
                        },
                        {
                            name: 'canAssignOrgRole',
                            status: 'passed',
                            errorMessages: [],
                            duration: 30,
                        },
                        {
                            name: 'removeRoleFromOrgDoesNotRemoveGlobal',
                            status: 'passed',
                            errorMessages: [],
                            duration: 28,
                        },
                        {
                            name: 'cantAssignSameRoleTwice',
                            status: 'passed',
                            errorMessages: [],
                            duration: 14,
                        },
                        {
                            name: 'canAddRemoveThenReAddRole',
                            status: 'passed',
                            errorMessages: [],
                            duration: 18,
                        },
                        {
                            name: 'removesTheCorrectRole',
                            status: 'passed',
                            errorMessages: [],
                            duration: 19,
                        },
                    ],
                },
                {
                    path: 'implementation/ContractValidator.test.ts',
                    status: 'passed',
                    tests: [
                        {
                            name: 'canRegisterContract',
                            status: 'passed',
                            errorMessages: [],
                            duration: 2,
                        },
                        {
                            name: 'cannotMixinContractWithDuplicateEvents',
                            status: 'passed',
                            errorMessages: [],
                            duration: 0,
                        },
                        {
                            name: 'canClearEventsFromContract',
                            status: 'passed',
                            errorMessages: [],
                            duration: 1,
                        },
                        {
                            name: 'clearingUnknownEventThrowsError',
                            status: 'passed',
                            errorMessages: [],
                            duration: 1,
                        },
                    ],
                },
                {
                    path: 'implementation/MercuryServer.test.ts',
                    status: 'passed',
                    tests: [
                        {
                            name: 'canCreateServer',
                            status: 'passed',
                            errorMessages: [],
                            duration: 28,
                        },
                        {
                            name: 'throwsWhenEmittingBadEvent',
                            status: 'passed',
                            errorMessages: [],
                            duration: 21,
                        },
                    ],
                },
                {
                    path: 'behavioral/UpdatingARole.test.ts',
                    status: 'failed',
                    errorMessage: testResults.testFiles.find(
                        (file) =>
                            file.path === 'behavioral/UpdatingARole.test.ts'
                    )?.errorMessage,
                    tests: [
                        {
                            name: 'hasUpdateRoleEvent',
                            status: 'failed',
                            errorMessages: testResults.testFiles.find(
                                (file) =>
                                    file.path ===
                                    'behavioral/UpdatingARole.test.ts'
                            )?.tests?.[0]?.errorMessages,
                            duration: 24,
                        },
                    ],
                },
                {
                    path: 'implementation/SkillGenerator.test.ts',
                    status: 'passed',
                    tests: [
                        {
                            name: 'canInstantiate',
                            status: 'passed',
                            errorMessages: [],
                            duration: 1,
                        },
                        {
                            name: 'generatesNewSkillValuesByName',
                            status: 'passed',
                            errorMessages: [],
                            duration: 1,
                        },
                    ],
                },
                {
                    path: 'implementation/Database.test.ts',
                    status: 'passed',
                    tests: [
                        {
                            name: 'throws error when updating record not found (neDb)',
                            status: 'passed',
                            errorMessages: [],
                            duration: 3,
                        },
                        {
                            name: 'can delete record (mongo)',
                            status: 'passed',
                            errorMessages: [],
                            duration: 47,
                        },
                        {
                            name: 'can upsert (neDb)',
                            status: 'passed',
                            errorMessages: [],
                            duration: 5,
                        },
                        {
                            name: 'can create a compound field unique index (mongo)',
                            status: 'passed',
                            errorMessages: [],
                            duration: 82,
                        },
                    ],
                },
            ],
            totalTestFilesComplete: 20,
            totalFailed: 1,
            totalPassed: 181,
            totalTests: 183,
            totalSkipped: 1,
            totalTodo: 0,
        })
    }
}
