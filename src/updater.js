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

  async createRelease(owner, repo, version, previousVersion) {
    console.log(`Creating release ${version}`)
    const result = await this.octokit.request('POST /repos/{owner}/{repo}/releases', {
      owner: owner,
      repo: repo,
      tag_name: version,
      name: version,
      body: `**Full Changelog**: https://github.com/${owner}/${repo}/compare/v${previousVersion}...${version}`
    })
    console.log(result.status)
    console.log(result.data)
  }

  async getLatestRelease(owner, repo) {
    const releases = await this.octokit.request('GET /repos/{owner}/{repo}/releases', {
      owner: owner,
      repo: repo
    })
    if (releases.status != 200) {
      console.log("Unable to fetch latest releases")
      throw new Error("Unable to fetch latest releases")
    }

    const data = releases.data
    if (!data.length) {
      return '0.0.0'
    }

    return data[0].tag_name.replace('v', '')
  }

  async getLatestCommit(owner, repo) {
    const commits = await this.octokit.request('GET /repos/{owner}/{repo}/commits', {
      owner: owner,
      repo: repo
    })
    if (commits.status != 200) {
      console.log("Unable to fetch latest commits")
      throw new Error("Unable to fetch latest commits")
    }

    return commits.data[0].sha
  }

  async update(owner, repo, changeType) {

    if (!VALID_TYPES.includes(changeType)) {
      console.log(`Invalid type: ${changeType}`)
      throw new Error(`Invalid type: ${changeType}`)
    }

    const tag = await this.getLatestRelease(owner, repo)
    const [major, minor, patch] = tag.split('.')

    const sha = await this.getLatestCommit(owner, repo)
    if (changeType == 'patch') {
      const releaseVersion = `v${[major, minor, parseInt(patch) + 1].join('.')}`
      await this.addTag(sha, owner, repo, releaseVersion)
      this.updateTag(sha, owner, repo, `v${[major, minor].join('.')}`)
      this.updateTag(sha, owner, repo, `v${major}`)

      this.createRelease(owner, repo, releaseVersion, tag)

      return
    }

    if (changeType == 'minor') {
      const releaseVersion = `v${[major, parseInt(minor) + 1, 0].join('.')}`
      await this.addTag(sha, owner, repo, releaseVersion)
      this.addTag(sha, owner, repo, `v${[major, parseInt(minor) + 1].join('.')}`)
      this.updateTag(sha, owner, repo, `v${major}`)

      this.createRelease(owner, repo, releaseVersion, tag)

      return
    }

    // changeType == 'major'
    const releaseVersion = `v${parseInt(major) + 1}.0.0`
    await this.addTag(sha, owner, repo, releaseVersion)
    this.addTag(sha, owner, repo, `v${parseInt(major) + 1}.0`)
    this.addTag(sha, owner, repo, `v${parseInt(major) + 1}`)

    this.createRelease(owner, repo, releaseVersion, tag)
  }

}

module.exports = Updater
