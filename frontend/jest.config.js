module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/js'],
  collectCoverageFrom: ['js/**/*.js', '!js/**/*.test.js', '!js/__tests__/**'],
  coverageDirectory: 'coverage',
  testMatch: ['**/__tests__/**/*.test.js'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
};
