const fs = require("fs");
const { spawn } = require("child_process");

const envFile = "/evolution/.env";
const port = process.env.PORT || process.env.SERVER_PORT || "8080";
process.env.SERVER_PORT = String(port);
process.env.SERVER_TYPE = process.env.SERVER_TYPE || "http";
process.env.CACHE_REDIS_ENABLED = process.env.CACHE_REDIS_ENABLED || "false";
process.env.CACHE_LOCAL_ENABLED = process.env.CACHE_LOCAL_ENABLED || "true";
process.env.DATABASE_PROVIDER = process.env.DATABASE_PROVIDER || "postgresql";
process.env.AUTHENTICATION_EXPOSE_IN_FETCH_INSTANCES =
  process.env.AUTHENTICATION_EXPOSE_IN_FETCH_INSTANCES || "true";
process.env.DEL_INSTANCE = process.env.DEL_INSTANCE || "false";

function normalizeDatabaseUri(uri) {
  let out = uri.trim().replace(/^postgres:/, "postgresql:");
  if (!/[?&]schema=/.test(out)) {
    out += `${out.includes("?") ? "&" : "?"}schema=public`;
  }
  return out;
}

let serverUrl = process.env.SERVER_URL || "";
if (serverUrl && !/^https?:\/\//i.test(serverUrl)) {
  serverUrl = `http://${serverUrl}`;
}
if (!serverUrl) {
  serverUrl = `http://127.0.0.1:${port}`;
}
process.env.SERVER_URL = serverUrl;

if (process.env.DATABASE_CONNECTION_URI) {
  process.env.DATABASE_CONNECTION_URI = normalizeDatabaseUri(
    process.env.DATABASE_CONNECTION_URI,
  );
}

const updates = {
  SERVER_TYPE: process.env.SERVER_TYPE,
  SERVER_PORT: process.env.SERVER_PORT,
  SERVER_URL: process.env.SERVER_URL,
  DATABASE_PROVIDER: process.env.DATABASE_PROVIDER,
  DATABASE_CONNECTION_URI: process.env.DATABASE_CONNECTION_URI,
  AUTHENTICATION_API_KEY: process.env.AUTHENTICATION_API_KEY,
  AUTHENTICATION_EXPOSE_IN_FETCH_INSTANCES:
    process.env.AUTHENTICATION_EXPOSE_IN_FETCH_INSTANCES,
  CACHE_REDIS_ENABLED: process.env.CACHE_REDIS_ENABLED,
  CACHE_LOCAL_ENABLED: process.env.CACHE_LOCAL_ENABLED,
  DEL_INSTANCE: process.env.DEL_INSTANCE,
};

let text = fs.existsSync(envFile) ? fs.readFileSync(envFile, "utf8") : "";
for (const [key, value] of Object.entries(updates)) {
  if (value == null || value === "") continue;
  const line = `${key}=${value}`;
  const re = new RegExp(`^${key}=.*$`, "m");
  text = re.test(text) ? text.replace(re, line) : `${text}\n${line}`;
}
fs.writeFileSync(envFile, text);

const child = spawn(
  "bash",
  ["-lc", ". ./Docker/scripts/deploy_database.sh && npm run start:prod"],
  { cwd: "/evolution", stdio: "inherit", env: process.env },
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
