// File: ./jest.config.js

// jest.config.js (ESM syntax)
export default {
   preset: 'ts-jest/presets/default-esm',
   testEnvironment: 'jsdom',
   extensionsToTreatAsEsm: ['.ts', '.tsx'],
   transform: {
      '^.+\\.(ts|tsx)$': ['ts-jest', {useESM: true}],
      '^.+\\.css$': 'jest-transform-stub',
   },
   moduleNameMapper: {
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      '^@/(.*)$': '<rootDir>/src/$1',
   },
   moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
