import { defineConfig } from 'vitest/config';

// Test files share one database and reset it in beforeEach, so run them one at a time.
export default defineConfig({ test: { fileParallelism: false } });
