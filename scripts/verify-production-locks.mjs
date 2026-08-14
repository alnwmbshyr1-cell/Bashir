import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../production-readiness.ts", import.meta.url), "utf8");
const checks = [
  ['LIVE_OPERATIONS_ENABLED is false', /export const LIVE_OPERATIONS_ENABLED = false;/],
  ['Yemen payments default to disabled', /countryCode: "YE",[\s\S]*?payments: "disabled"/],
  ['Yemen payouts default to disabled', /countryCode: "YE",[\s\S]*?payouts: "disabled"/],
  ['Creator earnings default to disabled', /countryCode: "YE",[\s\S]*?creatorEarnings: "disabled"/],
  ['Provider live payment guard always returns false', /function canProcessLivePayment\([^)]*\): false \{\s*return false;/],
];

const failed = checks.filter(([, pattern]) => !pattern.test(source));
if (failed.length > 0) {
  console.error("Production lock verification failed:", failed.map(([name]) => name).join(", "));
  process.exit(1);
}

console.log(`Production lock verification passed (${checks.length} checks).`);
