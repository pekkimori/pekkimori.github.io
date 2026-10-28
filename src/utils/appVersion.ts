import { execFileSync } from "node:child_process";
import { version } from "../../package.json";

// Server-only: each build reflects its checked-out revision, including CI.
const commitCount = execFileSync("git", ["rev-list", "--count", "HEAD"], {
  encoding: "utf8",
}).trim();

export const appVersion = `v${version}+${commitCount}`;
