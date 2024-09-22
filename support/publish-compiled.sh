#!/usr/bin/env bash

if ! command -v aws &>/dev/null; then
    echo "Error: AWS CLI is not installed or not in PATH"
    echo "Please install AWS CLI and configure it with your credentials"
    echo "Visit https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html for more information"
    exit 1
fi

echo "Publish SpruceCLI to S3"

# Pull version from package.json
version=$(node -p -e "require('./packages/spruce-cli/package.json').version")

# Define arrays for build names and their corresponding S3 names
build_names=(
    "spruce-darwin-arm64"
    "spruce-darwin-x64"
    "spruce-linux-arm64"
    "spruce-linux-x64"
    "spruce-windows-x64.exe"
)

s3_names=(
    "spruce-darwin-arm64-$version"
    "spruce-darwin-x64-$version"
    "spruce-linux-arm64-$version"
    "spruce-linux-x64-$version"
    "spruce-windows-x64-$version.exe"
)

echo "Publishing version $version to S3"

# Loop through build names and upload each found file
for i in "${!build_names[@]}"; do
    build_name="${build_names[$i]}"
    s3_name="${s3_names[$i]}"
    if [ -f "dist/$build_name" ]; then
        # s3 copy to bucket called spruce-theatre
        {
            aws s3 cp "dist/$build_name" "s3://spruce-theatre/$s3_name"
            echo "Uploading dist/$build_name to S3 as $s3_name"
            echo "Upload complete for $s3_name"
        } &
    else
        echo "File dist/$build_name not found, skipping."
    fi
done

wait

echo "Publication process completed."
