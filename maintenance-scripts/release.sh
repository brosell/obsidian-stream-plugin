#!/bin/bash

# Check if the git directory is clean
if ! git diff-index --quiet HEAD --; then
    echo "Git directory is not clean. Please commit your changes."
    exit 1
fi

# Check if the current branch is main
if [[ $(git rev-parse --abbrev-ref HEAD) != "main" ]]; then
    echo "You must be on the main branch to release."
    exit 1
fi

# Collect the version from package.json
VERSION=$(grep -m 1 '"version":' package.json | sed 's/[^0-9.]*//g')

echo "Release version identified as: ---$VERSION---"

# Check if the version tag already exists on the remote
if git ls-remote --tags origin | grep -q "$VERSION"; then
    echo "Error: Tag $VERSION already exists on the remote."
    exit 1
fi

# Confirm from the user to proceed with the release version
read -p "Are you sure you want to proceed with releasing version $VERSION? (y/n) " -n 1 -r
echo    # move to a new line
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Release cancelled."
    exit 1
fi

git push 
# Create and push the tag
git tag $VERSION
git push origin $VERSION

# Create the GitHub release with assets from ./build directory
gh release create $VERSION ./build/* --title "Release $VERSION" --notes "Release notes for version $VERSION"

echo "Release $VERSION created successfully."