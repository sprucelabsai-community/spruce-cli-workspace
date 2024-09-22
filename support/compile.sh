#!/bin/bash

./support/prep-cfonts.sh
cd packages/spruce-cli
bun build --compile --minify build/index.js --outfile dist/spruce