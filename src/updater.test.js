const Updater = require('./updater')

describe("Semver Updater", () => {

  test("Throw an error on bad input", async () => {
    const request = jest.fn()

    const updater = new Updater({ request })

    await expect(() => updater.update('foo', 'bar', 'bad-input'))
      .rejects
      .toThrow(new Error("Invalid type: bad-input"))
  })

  test("Throw an error when unable to fetch releases", async () => {
    const request = jest.fn()
      .mockReturnValueOnce(Promise.resolve({
        status: 500
      }))

    const updater = new Updater({ request })

    await expect(() => updater.update('foo', 'bar', 'patch'))
      .rejects
      .toThrow(new Error("Unable to fetch latest releases"))

    expect(request.mock.calls).toHaveLength(1)

    const release = request.mock.calls[0]
    expect(release[0]).toBe('GET /repos/{owner}/{repo}/releases')
    expect(release[1]).toEqual({
      owner: 'foo',
      repo: 'bar'
    })
  })

  test("Throw an error when unable to fetch commits", async () => {
    const request = jest.fn()
      .mockReturnValueOnce(Promise.resolve({
        status: 200,
        data: []
      }))
      .mockReturnValueOnce(Promise.resolve({
        status: 500
      }))

    const updater = new Updater({ request })

    await expect(() => updater.update('foo', 'bar', 'patch'))
      .rejects
      .toThrow(new Error("Unable to fetch latest commits"))

    expect(request.mock.calls).toHaveLength(2)

    const release = request.mock.calls[0]
    expect(release[0]).toBe('GET /repos/{owner}/{repo}/releases')
    expect(release[1]).toEqual({
      owner: 'foo',
      repo: 'bar'
    })

    const commit = request.mock.calls[1]
    expect(commit[0]).toBe('GET /repos/{owner}/{repo}/commits')
    expect(commit[1]).toEqual({
      owner: 'foo',
      repo: 'bar'
    })
  })

  test("Update patch version", async () => {
    const request = jest.fn()
      .mockReturnValueOnce(Promise.resolve({
        status: 200,
        data: [{
          tag_name: 'v1.0.3'
        }]
      }))
      .mockReturnValueOnce(Promise.resolve({
        status: 200,
        data: [{
          sha: 'iamasha'
        }]
      }))
      .mockReturnValueOnce(Promise.resolve({
        status: 201,
        data: 'success'
      }))
      .mockReturnValueOnce(Promise.resolve({
        status: 204,
        data: 'success'
      }))
      .mockReturnValueOnce(Promise.resolve({
        status: 201,
        data: 'success'
      }))
      .mockReturnValueOnce(Promise.resolve({
        status: 204,
        data: 'success'
      }))
      .mockReturnValueOnce(Promise.resolve({
        status: 201,
        data: 'success'
      }))
      .mockReturnValueOnce(Promise.resolve({
        status: 201,
        data: 'success'
      }))

    const updater = new Updater({ request })

    await updater.update('foo', 'bar', 'patch')

    expect(request.mock.calls).toHaveLength(6)

    const release = request.mock.calls[0]
    expect(release[0]).toBe('GET /repos/{owner}/{repo}/releases')
    expect(release[1]).toEqual({
      owner: 'foo',
      repo: 'bar'
    })

    const commit = request.mock.calls[1]
    expect(commit[0]).toBe('GET /repos/{owner}/{repo}/commits')
    expect(commit[1]).toEqual({
      owner: 'foo',
      repo: 'bar'
    })

    const bumpPatch = request.mock.calls[2]
    expect(bumpPatch[0]).toBe('POST /repos/{owner}/{repo}/git/refs')
    expect(bumpPatch[1]).toEqual({
      owner: 'foo',
      repo: 'bar',
      sha: 'iamasha',
      ref: 'refs/tags/v1.0.4'
    })

    const updateMinor = request.mock.calls[3]
    expect(updateMinor[0]).toBe('PATCH /repos/{owner}/{repo}/git/refs/tags/{version}')
    expect(updateMinor[1]).toEqual({
      owner: 'foo',
      repo: 'bar',
      sha: 'iamasha',
      version: 'v1.0',
      force: true
    })

    const updateMajor = request.mock.calls[4]
    expect(updateMajor[0]).toBe('PATCH /repos/{owner}/{repo}/git/refs/tags/{version}')
    expect(updateMajor[1]).toEqual({
      owner: 'foo',
      repo: 'bar',
      sha: 'iamasha',
      version: 'v1',
      force: true
    })

    const createRelease = request.mock.calls[5]
    expect(createRelease[0]).toBe('POST /repos/{owner}/{repo}/releases')
    expect(createRelease[1]).toEqual({
      owner: 'foo',
      repo: 'bar',
      tag_name: 'v1.0.4',
      name: 'v1.0.4',
      body: `**Full Changelog**: https://github.com/foo/bar/compare/v1.0.3...v1.0.4`
    })

  })

  test("Update minor version", async () => {
    const request = jest.fn()
      .mockReturnValueOnce(Promise.resolve({
        status: 200,
        data: [{
          tag_name: 'v1.0.3'
        }]
      }))
      .mockReturnValueOnce(Promise.resolve({
        status: 200,
        data: [{
          sha: 'iamasha'
        }]
      }))
      .mockReturnValueOnce(Promise.resolve({
        status: 201,
        data: 'success'
      }))
      .mockReturnValueOnce(Promise.resolve({
        status: 201,
        data: 'success'
      }))
      .mockReturnValueOnce(Promise.resolve({
        status: 204,
        data: 'success'
      }))
      .mockReturnValueOnce(Promise.resolve({
        status: 201,
        data: 'success'
      }))
      .mockReturnValueOnce(Promise.resolve({
        status: 201,
        data: 'success'
      }))

    const updater = new Updater({ request })

    await updater.update('foo', 'bar', 'minor')

    expect(request.mock.calls).toHaveLength(6)

    const release = request.mock.calls[0]
    expect(release[0]).toBe('GET /repos/{owner}/{repo}/releases')
    expect(release[1]).toEqual({
      owner: 'foo',
      repo: 'bar'
    })

    const commit = request.mock.calls[1]
    expect(commit[0]).toBe('GET /repos/{owner}/{repo}/commits')
    expect(commit[1]).toEqual({
      owner: 'foo',
      repo: 'bar'
    })

    const bumpMinorPatch = request.mock.calls[2]
    expect(bumpMinorPatch[0]).toBe('POST /repos/{owner}/{repo}/git/refs')
    expect(bumpMinorPatch[1]).toEqual({
      owner: 'foo',
      repo: 'bar',
      sha: 'iamasha',
      ref: 'refs/tags/v1.1.0'
    })

    const bumpMinor = request.mock.calls[3]
    expect(bumpMinor[0]).toBe('POST /repos/{owner}/{repo}/git/refs')
    expect(bumpMinor[1]).toEqual({
      owner: 'foo',
      repo: 'bar',
      sha: 'iamasha',
      ref: 'refs/tags/v1.1'
    })

    const updateMajor = request.mock.calls[4]
    expect(updateMajor[0]).toBe('PATCH /repos/{owner}/{repo}/git/refs/tags/{version}')
    expect(updateMajor[1]).toEqual({
      owner: 'foo',
      repo: 'bar',
      sha: 'iamasha',
      version: 'v1',
      force: true
    })

    const createRelease = request.mock.calls[5]
    expect(createRelease[0]).toBe('POST /repos/{owner}/{repo}/releases')
    expect(createRelease[1]).toEqual({
      owner: 'foo',
      repo: 'bar',
      tag_name: 'v1.1.0',
      name: 'v1.1.0',
      body: `**Full Changelog**: https://github.com/foo/bar/compare/v1.0.3...v1.1.0`
    })

  })

  test("Update major version", async () => {
    const request = jest.fn()
      .mockReturnValueOnce(Promise.resolve({
        status: 200,
        data: [{
          tag_name: 'v1.0.3'
        }]
      }))
      .mockReturnValueOnce(Promise.resolve({
        status: 200,
        data: [{
          sha: 'iamasha'
        }]
      }))
      .mockReturnValueOnce(Promise.resolve({
        status: 201,
        data: 'success'
      }))
      .mockReturnValueOnce(Promise.resolve({
        status: 201,
        data: 'success'
      }))
      .mockReturnValueOnce(Promise.resolve({
        status: 201,
        data: 'success'
      }))
      .mockReturnValueOnce(Promise.resolve({
        status: 201,
        data: 'success'
      }))

    const updater = new Updater({ request })

    await updater.update('foo', 'bar', 'major')

    expect(request.mock.calls).toHaveLength(6)

    const release = request.mock.calls[0]
    expect(release[0]).toBe('GET /repos/{owner}/{repo}/releases')
    expect(release[1]).toEqual({
      owner: 'foo',
      repo: 'bar'
    })

    const commit = request.mock.calls[1]
    expect(commit[0]).toBe('GET /repos/{owner}/{repo}/commits')
    expect(commit[1]).toEqual({
      owner: 'foo',
      repo: 'bar'
    })

    const bumpMajorMinorPatch = request.mock.calls[2]
    expect(bumpMajorMinorPatch[0]).toBe('POST /repos/{owner}/{repo}/git/refs')
    expect(bumpMajorMinorPatch[1]).toEqual({
      owner: 'foo',
      repo: 'bar',
      sha: 'iamasha',
      ref: 'refs/tags/v2.0.0'
    })

    const bumpMajorMinor = request.mock.calls[3]
    expect(bumpMajorMinor[0]).toBe('POST /repos/{owner}/{repo}/git/refs')
    expect(bumpMajorMinor[1]).toEqual({
      owner: 'foo',
      repo: 'bar',
      sha: 'iamasha',
      ref: 'refs/tags/v2.0'
    })

    const bumpMajor = request.mock.calls[4]
    expect(bumpMajor[0]).toBe('POST /repos/{owner}/{repo}/git/refs')
    expect(bumpMajor[1]).toEqual({
      owner: 'foo',
      repo: 'bar',
      sha: 'iamasha',
      ref: 'refs/tags/v2'
    })

    const createRelease = request.mock.calls[5]
    expect(createRelease[0]).toBe('POST /repos/{owner}/{repo}/releases')
    expect(createRelease[1]).toEqual({
      owner: 'foo',
      repo: 'bar',
      tag_name: 'v2.0.0',
      name: 'v2.0.0',
      body: `**Full Changelog**: https://github.com/foo/bar/compare/v1.0.3...v2.0.0`
    })

  })

  test("Update major version when no prior releases", async () => {
    const request = jest.fn()
      .mockReturnValueOnce(Promise.resolve({
        status: 200,
        data: []
      }))
      .mockReturnValueOnce(Promise.resolve({
        status: 200,
        data: [{
          sha: 'iamasha'
        }]
      }))
      .mockReturnValueOnce(Promise.resolve({
        status: 201,
        data: 'success'
      }))
      .mockReturnValueOnce(Promise.resolve({
        status: 201,
        data: 'success'
      }))
      .mockReturnValueOnce(Promise.resolve({
        status: 201,
        data: 'success'
      }))
      .mockReturnValueOnce(Promise.resolve({
        status: 201,
        data: 'success'
      }))

    const updater = new Updater({ request })

    await updater.update('foo', 'bar', 'major')

    expect(request.mock.calls).toHaveLength(6)

    const release = request.mock.calls[0]
    expect(release[0]).toBe('GET /repos/{owner}/{repo}/releases')
    expect(release[1]).toEqual({
      owner: 'foo',
      repo: 'bar'
    })

    const commit = request.mock.calls[1]
    expect(commit[0]).toBe('GET /repos/{owner}/{repo}/commits')
    expect(commit[1]).toEqual({
      owner: 'foo',
      repo: 'bar'
    })

    const bumpMajorMinorPatch = request.mock.calls[2]
    expect(bumpMajorMinorPatch[0]).toBe('POST /repos/{owner}/{repo}/git/refs')
    expect(bumpMajorMinorPatch[1]).toEqual({
      owner: 'foo',
      repo: 'bar',
      sha: 'iamasha',
      ref: 'refs/tags/v1.0.0'
    })

    const bumpMajorMinor = request.mock.calls[3]
    expect(bumpMajorMinor[0]).toBe('POST /repos/{owner}/{repo}/git/refs')
    expect(bumpMajorMinor[1]).toEqual({
      owner: 'foo',
      repo: 'bar',
      sha: 'iamasha',
      ref: 'refs/tags/v1.0'
    })

    const bumpMajor = request.mock.calls[4]
    expect(bumpMajor[0]).toBe('POST /repos/{owner}/{repo}/git/refs')
    expect(bumpMajor[1]).toEqual({
      owner: 'foo',
      repo: 'bar',
      sha: 'iamasha',
      ref: 'refs/tags/v1'
    })

    const createRelease = request.mock.calls[5]
    expect(createRelease[0]).toBe('POST /repos/{owner}/{repo}/releases')
    expect(createRelease[1]).toEqual({
      owner: 'foo',
      repo: 'bar',
      tag_name: 'v1.0.0',
      name: 'v1.0.0',
      body: `**Full Changelog**: https://github.com/foo/bar/compare/v0.0.0...v1.0.0`
    })

  })

})
