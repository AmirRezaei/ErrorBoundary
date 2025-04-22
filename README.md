## Scripts

- **`setup`**: Installs all dependencies.
- **`install:yarn`**: Installs Yarn globally if not already installed.
- **`dev`**: Starts the development server on port 3000.
- **`dev:debug`**: Starts the development server with debugging enabled.
- **`start`**: Alias for `dev`.
- **`build`**: Cleans the console, removes `dist`, and builds the project.
- **`UpgradeToLatest`**: Clears the console, upgrades all dependencies to their latest versions, deduplicates the
  lockfile, reinstalls dependencies, cleans the project, and starts the development server.
- **`preview`**: Previews the production build.
- **`lint`**: Runs ESLint on the project.
- **`lint:fix`**: Runs ESLint and automatically fixes fixable issues.
- **`format`**: Formats the project files using Prettier.
- **`format:eslint`**: Runs ESLint with auto-fix and then formats with Prettier.
- **`format:debug`**: Runs Prettier with debugging enabled.
- **`clean`**: Removes the `dist` directory and Vite's cache.
- **`clean:all`**: Removes `node_modules` and reinstalls dependencies.
- **`clean:prettier`**: Formats files with Prettier using cache.
- **`analyze`**: Builds the project in analyze mode.
- **`check:types`**: Checks TypeScript types without emitting output.
- **`prepend-header`**: Runs a Node script to prepend headers to files.
- **`prepend-client-directive`**: Runs a Node script to prepend client directives.
- **`deploy`**: Builds the project and copies the `dist` directory to the deployment target.
- **`reinstall`**: Removes `node_modules` and `yarn.lock`, cleans the cache, reinstalls dependencies, and deduplicates
  the lockfile.
- **`deduplicate`**: Optimizes the `yarn.lock` file by removing duplicate dependencies.
- **`test`**: Runs Jest tests.
- **`test:watch`**: Runs Jest in watch mode.
- **`test:coverage`**: Runs Jest and generates coverage reports.
