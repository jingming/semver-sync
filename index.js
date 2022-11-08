const core = require('@actions/core')
const { Octokit } = require('@octokit/rest')
const Updater = require('./src/updater')

async function run() {
  const octokit = new Octokit({
    auth: core.getInput('token'),
  })
  const updater = new Updater(octokit)
  updater.update(core.getInput('owner'), core.getInput('repo'), core.getInput('change-type'))
}

run()
