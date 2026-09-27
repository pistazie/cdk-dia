module.exports = {
    testMatch: ['**/src/**/tests/**/*.test.ts'],
    testPathIgnorePatterns: ["/node_modules/"],
    reporters: ["default"],
    globalSetup: "./testSetup.js",
    setupFilesAfterEnv: ["jest-specific-snapshot"],
    testEnvironment: "node",
    transformIgnorePatterns: [
        "/node_modules/(?!(chalk|terminal-link|ansi-escapes|environment|supports-hyperlinks|has-flag|supports-color|ts-graphviz|@ts-graphviz)/)"
    ]
}
