
VALID_TYPES = ['patch', 'minor', 'major']


class Updater {

  constructor(octokit) {
    this.octokit = octokit
  }

  async update(owner, repo, changeType) {

    if (!VALID_TYPES.includes(changeType)) {
      console.log(`Invalid type: ${changeType}`)
      throw new Error(`Invalid type: ${changeType}`)
    }

    releases = await this.octokit.request('GET /repos/{owner}/{repo}/releases', {
      owner: owner,
      repo: repo
    })

    console.log(releases);
    // major, minor, patch =

  }


}