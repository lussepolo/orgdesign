// Phase 15F browser QA configuration.
// Run: npm run qa:phase15f  (uses tsx tests/phase15f/phase15f.run.ts + playwright library)
// If switching to @playwright/test runner in the future, this config applies directly.
export default {
  testDir: "./tests",
  use: {
    baseURL: "http://127.0.0.1:4175",
    headless: true,
  },
  webServer: {
    command: "npx vite --port 4175 --host 127.0.0.1",
    port: 4175,
    reuseExistingServer: false,
  },
};
