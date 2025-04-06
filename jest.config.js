module.exports = {
    testEnvironment: "node",
    roots: ["<rootDir>/test"], // Specify where to look for tests
    setupFilesAfterEnv: ["<rootDir>/test/jest.setup.js"],
    collectCoverage: true,
    coverageDirectory: "coverage",
    coverageReporters: [
        "json",
        "html",
        "clover",
        "lcov",
        [
            "text",
            "text-summary",
            {
                skipFull: true,
            },
        ],
    ],
    moduleFileExtensions: ["js", "json"],
    testMatch: ["**/*.test.js"],
    verbose: true,
    coverageThreshold: {
        global: {
            // branches: 50,
            // functions: 50,
            lines: 50,
            // statements: 50,
        },
    },
};
