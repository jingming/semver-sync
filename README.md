# semver-sync

Action to sync semver tags for a GitHub Action

This action will release a new version and sync prior release semver versions
as need to point to the latest release tag.

## Usage

```yaml
name: Update the release version and sync any semver tags as needed.

on:
  workflow_dispatch:
    inputs:
      change-type:
        description: 'Type of change to release'
        type: choice
        options:
          - major
          - minor
          - patch
        required: true


jobs:
  update-release:
    runs-on: ubuntu-latest
    steps:
      - name: Update tags
        uses: jingming/semver-sync@main
        with:
          owner: jingming
          repo: semver-sync
          change-type: ${{ inputs.change-type }}
          token: ${{ secrets.GITHUB_TOKEN }}

```

## Examples

If the current release is `v1.2.3` and this action is run to release a `patch`
version, the action will

- tag the latest commit as `v1.2.4`
- update the `v1.2` tag to point to the latest commit
- update the `v1` tag to point to the latest commit
- generate a `v1.2.4` release with a body diffing `v1.2.3` and `v1.2.4`

If the current release is `v1.2.3` and this action is run to release a `minor`
version, the action will

- tag the latest commit as `v1.3.0`
- tag the latest commit as `v1.3`
- update the `v1` tag to point to the latest commit
- generate a `v1.3.0` release with a body diffing `v1.2.3` and `v1.3.0`

If the current release is `v1.2.3` and this action is run to release a `major`
version, the action will

- tag the latest commit as `v2.0.0`
- tag the latest commit as `v2.0`
- tag the latest commit as `v2`
- generate a `v2.0.0` release with a body diffing `v1.2.3` and `v2.0.0`
