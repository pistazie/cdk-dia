module.exports = {
    testMatch: ['**/src/**/tests/**/*.test.ts'],
    testPathIgnorePatterns: ["/node_modules/"],
    reporters: ["default"],
    globalSetup: "./testSetup.js",
    testEnvironment: "node",
    // ESM-only deps must be transpiled to CJS by babel-jest (Jest's native require(esm) needs Node >= 24.9)
    transformIgnorePatterns: [
        "/node_modules/(?!(chalk|terminal-link|ansi-escapes|environment|supports-hyperlinks|has-flag|supports-color|ts-graphviz|@ts-graphviz)/)"
    ]
}