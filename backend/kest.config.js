export default {
  testEnvironment: "node",
  transform: { "^.+\\.js$": "babel-jest" },
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/db/**"    // optional
  ],
  coverageThreshold: {
    global: {
      lines: 75,
      functions: 75,
      branches: 75,
      statements: 75
    }
  }
};
