#!/bin/sh
set -eu
if [ "$#" -gt 0 ]; then
  if [ "$#" -eq 2 ] && [ "$1" = '--print-review-hook' ]; then
    case "$2" in
      false|true) printf 'EXPLORATORY_REVIEW_HOOK=%s codex\n' "$2"; exit 0 ;;
    esac
  fi
  printf 'Usage: sh tools/install-codex.sh [--print-review-hook false|true]\n' >&2
  exit 2
fi
repo_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
skills_dir=${CODEX_HOME:-"$HOME/.codex"}/skills

for source_dir in "$repo_dir"/skills/exploratory "$repo_dir"/skills/mcp-*/*; do
  [ -f "$source_dir/SKILL.md" ] || continue
  target_dir="$skills_dir/$(basename -- "$source_dir")"
  if [ -e "$target_dir" ] || [ -L "$target_dir" ]; then
    printf '既存のスキルがあるため停止します: %s\n' "$target_dir" >&2
    exit 1
  fi
done

mkdir -p "$skills_dir"
for source_dir in "$repo_dir"/skills/exploratory "$repo_dir"/skills/mcp-*/*; do
  [ -f "$source_dir/SKILL.md" ] || continue
  ln -s "$source_dir" "$skills_dir/$(basename -- "$source_dir")"
done
printf 'スキルを配置しました: %s\n' "$skills_dir"
