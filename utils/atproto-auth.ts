import fs from "fs";
import os from "os";
import path from "path";

import { AtpAgent } from "@atproto/api";

import { SEQUOIA_CONFIG_FILE } from "utils/sequoia";

type AppPasswordCredentials = {
  type: "app-password";
  identifier: string;
  password: string;
  pdsUrl: string;
};

const SEQUOIA_CREDENTIALS_FILE = path.join(
  os.homedir(),
  ".config",
  "sequoia",
  "credentials.json"
);

function readSequoiaIdentity() {
  try {
    const config = JSON.parse(fs.readFileSync(SEQUOIA_CONFIG_FILE, "utf8"));
    return typeof config.identity === "string" ? config.identity : undefined;
  } catch {
    return undefined;
  }
}

function readAppPasswordCredentials(
  preferredIdentity?: string
): AppPasswordCredentials | null {
  const envIdentifier = process.env.ATP_IDENTIFIER;
  const envPassword = process.env.ATP_APP_PASSWORD;
  const envPdsUrl = process.env.PDS_URL;

  if (envIdentifier && envPassword) {
    return {
      type: "app-password",
      identifier: envIdentifier,
      password: envPassword,
      pdsUrl: envPdsUrl || "https://bsky.social",
    };
  }

  if (!fs.existsSync(SEQUOIA_CREDENTIALS_FILE)) {
    return null;
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(SEQUOIA_CREDENTIALS_FILE, "utf8"));

    if (parsed.identifier && parsed.password) {
      return {
        type: "app-password",
        identifier: parsed.identifier,
        password: parsed.password,
        pdsUrl: parsed.pdsUrl || "https://bsky.social",
      };
    }

    const identity = preferredIdentity || readSequoiaIdentity();
    if (identity && parsed[identity]?.identifier && parsed[identity]?.password) {
      return {
        type: "app-password",
        identifier: parsed[identity].identifier,
        password: parsed[identity].password,
        pdsUrl: parsed[identity].pdsUrl || "https://bsky.social",
      };
    }

    const firstEntry = Object.values(parsed)[0] as
      | { identifier?: string; password?: string; pdsUrl?: string }
      | undefined;

    if (firstEntry?.identifier && firstEntry.password) {
      return {
        type: "app-password",
        identifier: firstEntry.identifier,
        password: firstEntry.password,
        pdsUrl: firstEntry.pdsUrl || "https://bsky.social",
      };
    }
  } catch {
    return null;
  }

  return null;
}

export async function createAuthenticatedAgent() {
  const credentials = readAppPasswordCredentials();

  if (!credentials) {
    throw new Error(
      "No ATProto credentials found. Set ATP_IDENTIFIER and ATP_APP_PASSWORD, or run `pnpm exec sequoia login`."
    );
  }

  const agent = new AtpAgent({ service: credentials.pdsUrl });
  await agent.login({
    identifier: credentials.identifier,
    password: credentials.password,
  });

  return agent;
}
