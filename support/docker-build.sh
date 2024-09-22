#!/bin/bash

set -e

# Default value
ARCH=""
CONTAINER_NAME=""
PORT=""

# optionally delete yarn.lock
rm -f yarn.lock

# Function to print usage
print_usage() {
    echo "Usage: $0 --arch=<ubuntu-x64|ubuntu-arm>"
    echo " --arch: Specify the architecture (ubuntu-x64, ubuntu-arm, or theatre)"
}

# Parse arguments
for arg in "$@"; do
    case $arg in
    --arch=*)
        ARCH="${arg#*=}"
        ;;
    *)
        echo "Unknown parameter: $arg"
        print_usage
        exit 1
        ;;
    esac
done

# Validate architecture
if [[ "$ARCH" != "ubuntu-x64" && "$ARCH" != "ubuntu-arm" && "$ARCH" != "theatre" ]]; then
    echo "Error: Invalid architecture. Must be either ubuntu-x64 or ubuntu-arm."
    print_usage
    exit 1
fi

# Ensure arch is provided
if [[ -z "$ARCH" ]]; then
    echo "Error: Architecture must be specified."
    print_usage
    exit 1
fi

# Set the project directory (parent of the script's directory)
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Determine Dockerfile path based on architecture
DOCKERFILE_PATH="$PROJECT_DIR/support/dockerfile.$ARCH"

# Set the image and container names
IMAGE_NAME="spruce-cli-$ARCH"
CONTAINER_NAME="spruce-cli-$ARCH"

# Set the port based on architecture
if [[ "$ARCH" == "ubuntu-x64" ]]; then
    PORT=2223
elif [[ "$ARCH" == "ubuntu-arm" ]]; then
    PORT=2224
elif [[ "$ARCH" == "theatre" ]]; then
    PORT=2222
fi

# Function to run yarn commands
run_yarn_commands() {
    docker exec -it $CONTAINER_NAME /bin/bash -c "cd /app/spruce-cli && yarn && yarn compile"
}

ensure_container_running() {
    local port_mappings="-p $PORT:22"

    if ! docker inspect -f '{{.State.Running}}' $CONTAINER_NAME &>/dev/null; then
        echo "Container doesn't exist. Creating and starting it..."
        docker run -d --name $CONTAINER_NAME \
            -v "${PROJECT_DIR}:/app/spruce-cli" \
            -w /app/spruce-cli \
            $port_mappings \
            $IMAGE_NAME \
            tail -f /dev/null
    elif [ "$(docker inspect -f '{{.State.Running}}' $CONTAINER_NAME)" = "false" ]; then
        echo "Container exists but is not running. Starting it..."
        docker start $CONTAINER_NAME
    fi

    # Wait for container to be in running state
    for i in {1..10}; do
        if [ "$(docker inspect -f '{{.State.Running}}' $CONTAINER_NAME)" = "true" ]; then
            echo "Container is now running."
            return 0
        fi
        echo "Waiting for container to start... (attempt $i)"
        sleep 2
    done

    echo "Container failed to start. Checking logs:"
    docker logs $CONTAINER_NAME
    return 1
}

if [[ "$(docker images -q $IMAGE_NAME 2>/dev/null)" == "" ]]; then
    echo "Image doesn't exist. Building Docker image..."
    docker build --no-cache --progress=plain -f $DOCKERFILE_PATH -t $IMAGE_NAME .
fi

if ! ensure_container_running; then
    echo "Failed to start the container. Please check the Dockerfile and try again."
    exit 1
fi

echo "Running yarn commands in container..."
if ! run_yarn_commands; then
    echo "Failed to run yarn commands. Container logs:"
    docker logs $CONTAINER_NAME
fi

echo "Finished"
docker exec -it $CONTAINER_NAME /bin/bash
