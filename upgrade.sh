#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

collect_packages() {
  local package_json=$1
  local field=$2

  jq -r --arg field "$field" '
    def ignore:
      (([
        (.skill.upgradeIgnoreList // []),
        (."yarn-upgrade-all".ignore // [])
      ] | add) // [] | unique);

    (ignore) as $ignore
    | (.[ $field ] // {})
    | keys[] as $name
    | select(($ignore | index($name)) | not)
    | $name
  ' "$package_json"
}

upgrade_workspace() {
  local relative_dir=$1
  local name=$2

  pushd "$ROOT_DIR/$relative_dir" >/dev/null
  echo "Upgrading $name"

  local dependencies_output=""
  dependencies_output="$(collect_packages package.json dependencies || true)"
  local dependencies=()
  if [[ -n "$dependencies_output" ]]; then
    while IFS= read -r dependency; do
      [[ -n "$dependency" ]] && dependencies+=("$dependency")
    done <<<"$dependencies_output"
  fi

  if ((${#dependencies[@]})); then
    echo "  dependencies: ${dependencies[*]}"
    yarn add "${dependencies[@]}"
  else
    echo "  no dependencies to upgrade"
  fi

  local dev_dependencies_output=""
  dev_dependencies_output="$(collect_packages package.json devDependencies || true)"
  local dev_dependencies=()
  if [[ -n "$dev_dependencies_output" ]]; then
    while IFS= read -r dev_dependency; do
      [[ -n "$dev_dependency" ]] && dev_dependencies+=("$dev_dependency")
    done <<<"$dev_dependencies_output"
  fi

  if ((${#dev_dependencies[@]})); then
    echo "  devDependencies: ${dev_dependencies[*]}"
    yarn add -D "${dev_dependencies[@]}"
  else
    echo "  no devDependencies to upgrade"
  fi

  popd >/dev/null
}

upgrade_workspace "packages/spruce-cli" "@sprucelabs/spruce-cli"
upgrade_workspace "packages/spruce-templates" "@sprucelabs/spruce-templates"

pushd "$ROOT_DIR" >/dev/null
yarn rebuild
popd >/dev/null
