# Run the preparation script
./support/prep-cfonts.sh

# Change to the CLI directory
cd packages/spruce-cli

# Compile for all targets
for target in "windows-x64" "darwin-x64" "darwin-arm64" "linux-x64" "linux-arm64"; do
    bun build --compile --minify --target=bun-$target build/index.js --outfile ../../dist/spruce-$target
done

echo "Compiled binary: $OUTPUT_FILE"