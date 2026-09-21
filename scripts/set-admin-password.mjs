#!/usr/bin/env node
// Sets the admin's Supabase password without it ever touching disk or shell history.
// Usage: npm run admin:password
// Needs: .env.local with NEXT_PUBLIC_SUPABASE_URL + ADMIN_EMAIL, and `npx supabase login`.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import readline from "node:readline";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const email = env.ADMIN_EMAIL;
if (!url || !email) throw new Error("NEXT_PUBLIC_SUPABASE_URL and ADMIN_EMAIL must be set in .env.local");
const ref = new URL(url).hostname.split(".")[0];

function ask(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (s) => rl.output.write(s.startsWith(question) ? s : ""); // hide typed characters
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
  });
}

const password = await ask("New admin password: ");
if (password.length < 12) throw new Error("Use at least 12 characters.");
if ((await ask("Repeat password: ")) !== password) throw new Error("Passwords don't match.");

const keys = JSON.parse(
  execFileSync("npx", ["--yes", "supabase", "projects", "api-keys", "--project-ref", ref, "--reveal", "-o", "json"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }),
);
const secret = keys.find((k) => k.type === "secret")?.api_key;
if (!secret) throw new Error("Could not read the project's secret key. Run `npx supabase login` first.");
const headers = { apikey: secret, authorization: `Bearer ${secret}`, "content-type": "application/json" };

const list = await fetch(`${url}/auth/v1/admin/users?per_page=1000`, { headers }).then((r) => r.json());
const user = list.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
if (!user) throw new Error(`No Supabase user with email ${email}.`);

const res = await fetch(`${url}/auth/v1/admin/users/${user.id}`, {
  method: "PUT",
  headers,
  body: JSON.stringify({ password }),
});
if (!res.ok) throw new Error(`Supabase rejected the update: ${(await res.json()).msg ?? res.status}`);
console.log(`Password updated for ${email}. Sign in with username "admin".`);
