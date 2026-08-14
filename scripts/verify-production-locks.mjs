import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../production-readiness.ts", import.meta.url), "utf8");
const checks = [
  ['LIVE_SOCIAL_ENABLED is false', /export const LIVE_SOCIAL_ENABLED = false;/],
  ['Community policy has no financial services', /YemenBook is a non-financial community/],
  ['Messaging readiness gate exists', /id: "messaging"/],
  ['Media readiness gate exists', /id: "media"/],
  ['Moderation readiness gate exists', /id: "moderation"/],
];

const failed = checks.filter(([, pattern]) => !pattern.test(source));
if (failed.length > 0) {
  console.error("Production lock verification failed:", failed.map(([name]) => name).join(", "));
  process.exit(1);
}

console.log(`Community readiness verification passed (${checks.length} checks).`);
