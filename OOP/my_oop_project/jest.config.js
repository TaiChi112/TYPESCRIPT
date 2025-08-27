/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    testMatch: ['**/*.test.ts'],
    clearMocks: true,
    coverageDirectory: 'coverage',
    testPathIgnorePatterns: ['/node_modules/'],
};