module.exports = {
  coverageThreshold: {
    global: {
      lines: 80,
    },
  },
  collectCoverageFrom: [
    "actions/**/*.js",
    "!actions/**/index.js"
  ],
  coverageReporters: [
    "json-summary"
  ]
};
