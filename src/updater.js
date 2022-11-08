
VALID_TYPES = ['patch', 'minor', 'major']


class Updater {

  constructor(octokit) {
    this.octokit = octokit
  }

  async addTag(sha, owner, repo, version) {
    console.log(`Adding tag ${version}`)
    const result = await this.octokit.request('POST /repos/{owner}/{repo}/git/refs', {
      owner: owner,
      repo: repo,
      sha: sha,
      ref: `refs/tags/${version}`
    })
    console.log(result.status)
    console.log(result.data)
  }

  async updateTag(sha, owner, repo, version) {
    console.log(`Updating tag ${version}`)
    const result = await this.octokit.request('PATCH /repos/{owner}/{repo}/git/refs/tags/{version}', {
      owner: owner,
      repo: repo,
      version: version,
      sha: sha,
      force: true
    })
    console.log(result.status)
    console.log(result.data)
  }

  async update(owner, repo, changeType) {

    if (!VALID_TYPES.includes(changeType)) {
      console.log(`Invalid type: ${changeType}`)
      throw new Error(`Invalid type: ${changeType}`)
    }

    const releases = await this.octokit.request('GET /repos/{owner}/{repo}/releases', {
      owner: owner,
      repo: repo
    })
    if (releases.status != 200) {
      console.log("Unable to fetch latest releases")
      throw new Error("Unable to fetch latest releases")
    }

    const commits = await this.octokit.request('GET /repos/{owner}/{repo}/commits', {
      owner: owner,
      repo: repo
    })
    if (commits.status != 200) {
      console.log("Unable to fetch latest commits")
      throw new Error("Unable to fetch latest commits")
    }

    const sha = commits.data[0].sha;
    const tag = releases.data[0].tag_name.replace('v', '')
    const [major, minor, patch] = tag.split('.')
    if (changeType == 'patch') {
      this.addTag(sha, owner, repo, `v${[major, minor, parseInt(patch) + 1].join('.')}`)
      this.updateTag(sha, owner, repo, `v${[major, minor].join('.')}`)
      this.updateTag(sha, owner, repo, `v${major}`)

      return
    }

    if (changeType == 'minor') {
      this.addTag(sha, owner, repo, `v${[major, parseInt(minor) + 1, 0].join('.')}`)
      this.addTag(sha, owner, repo, `v${[major, parseInt(minor) + 1].join('.')}`)
      this.updateTag(sha, owner, repo, `v${major}`)

      return
    }

    // changeType == 'major'
    this.addTag(sha, owner, repo, `v${parseInt(major) + 1}.0.0`)
    this.addTag(sha, owner, repo, `v${parseInt(major) + 1}.0`)
    this.addTag(sha, owner, repo, `v${parseInt(major) + 1}`)
  }

}

module.exports = Updater
