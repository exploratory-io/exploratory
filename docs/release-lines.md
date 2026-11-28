# Release lines of the Desktop plugin

Each minor version of Exploratory Desktop installs the Desktop plugin from its own branch of this repository. A plugin release only has to work with the Desktop versions of its line.

| Exploratory Desktop | Branch | Plugin version |
|---|---|---|
| 17.1 and earlier | `main` | `0.x` (for example `0.1.10`) |
| 17.2 | `desktop-17.2` | `17.2.n` (for example `17.2.0`) |

Desktop reads its branch in three places: the marketplace it adds in Claude Code (`exploratory-io/exploratory#desktop-17.2`) and Codex (`exploratory-io/exploratory@desktop-17.2`), the `git clone --branch` it runs for Antigravity and Cursor, and the `marketplace.json` it reads to find the latest version. Merging into a line branch publishes to every Desktop of that line at once.

## Version numbers

- On `desktop-X.Y`, the Desktop plugin version is `X.Y.n`. On `main` it stays `0.x`.
- Versions never overlap between lines, so a client that caches by version always sees a new version after a line change, and a Desktop can tell a plugin of another line from its first two numbers.
- The `Version bump` check fails a pull request whose Desktop plugin version does not belong to its target branch, and one that changes plugin files without raising the version.

## Releasing

1. Branch from the line branch, for example `release/desktop-17.2.1` from `desktop-17.2`.
2. Make the change, raise the Desktop plugin version in all six files (the four client manifests in `plugins/exploratory-desktop/`, `.claude-plugin/marketplace.json` and `.agents/plugins/marketplace.json`), and add a `CHANGELOG.md` entry.
3. Open the pull request against the line branch and merge it. The merge is the release.
4. If other lines need the same change, merge it forward with `git merge`, from the older line to the newer one, and raise the version on each line it reaches.

## Rules

- The Server plugin (`plugins/exploratory-server`) is released from `main` only. Its files on a `desktop-*` branch are a copy that came with a merge from `main`; no client reads them.
- Do not remove a `userConfig` option across lines. When Desktop moves a Claude Code installation to a new line, it reinstalls the plugin with the options the user set, and Claude Code rejects an option the new manifest no longer declares.
- Protect every `desktop-*` branch like `main`: pull requests only, with the `Version bump` check required.

## Starting a new line

1. Create `desktop-X.Y` from the newest line branch.
2. Set the Desktop plugin version to `X.Y.0` in the six files, and update the README install commands and the CHANGELOG.
3. Push the branch before any Desktop build that reads it is distributed: a Desktop whose branch does not exist cannot read the latest version, and its install buttons stay disabled.
4. Add the branch to the table above, on `main` and on the new branch.
