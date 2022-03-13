cd packages/spruce-cli 
yarn add -E @babel/cli @babel/plugin-proposal-decorators @babel/runtime @jest/reporters @sprucelabs/error @sprucelabs/heartwood-view-controllers @sprucelabs/jest-json-reporter @sprucelabs/mercury-client @sprucelabs/mercury-event-emitter @sprucelabs/mercury-types @sprucelabs/schema @sprucelabs/spruce-core-schemas @sprucelabs/spruce-event-plugin @sprucelabs/spruce-event-utils @sprucelabs/spruce-skill-booter @sprucelabs/spruce-skill-utils @sprucelabs/spruce-templates cfonts chokidar cli-table3 core-js fs-extra gifwrap inflection inquirer js-tetris-cli jsonwebtoken lodash-es md5 open semver string-argv tree-kill tsutils uuid
yarn add -E -D @sprucelabs/data-stores @sprucelabs/jest-sheets-reporter @sprucelabs/mercury-core-events @sprucelabs/resolve-path-aliases @sprucelabs/spruce-conversation-plugin @sprucelabs/spruce-deploy-plugin @sprucelabs/spruce-store-plugin @sprucelabs/spruce-test-fixtures @sprucelabs/test @sprucelabs/test-utils @types/blessed @types/eslint @types/fs-extra @types/inflection @types/inquirer @types/jsonwebtoken @types/lodash @types/md5 @types/mkdirp @types/node @types/promise.allsettled @types/ps-node @types/rimraf @types/semver @types/sha1 @types/slug @types/superagent @types/terminal-kit @types/uuid chokidar-cli concurrently conventional-changelog-sprucelabs dotenv eslint eslint-config-spruce find-process jest jest-circus jest-junit jest-reporters prettier ps-node rimraf ts-jest ts-node tsc-watch tsconfig-paths typescript 

cd ../spruce-templates
yarn add -E @sprucelabs/mercury-types @sprucelabs/schema @sprucelabs/spruce-skill-utils handlebars lodash sha1
yarn add -E -D @types/lodash @types/node chokidar-cli concurrently conventional-changelog-sprucelabs prettier typescript

yarn rebuild
