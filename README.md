# Obsidian Stream (of Consciousness)


# To release
- Make sure the current origin HEAD is behaving
- `npm run release-[patch|minor|major]`

This will
- update the versions in package.json, (obsidian plugin's) manifest.json, versions.json
- build the source
- create a release and tag in the repo
  - Requires GitHub CLI: https://github.com/cli/cli
