import { Client, Account, Databases } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://api.nafen.sbs/v1")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "69bdb28e003c4db80f0a");

const account = new Account(client);
const databases = new Databases(client);

let cachedJWT = null;
let jwtExpiry = null;

async function getValidJWT() {
  if (cachedJWT && jwtExpiry && Date.now() < jwtExpiry) {
    return cachedJWT;
  }
  const response = await account.createJWT();
  cachedJWT = response.jwt;
  // Appwrite JWTs expire in 15 minutes. Cache for 13 minutes to be safe.
  jwtExpiry = Date.now() + 13 * 60 * 1000;
  return cachedJWT;
}

export { client, account, databases, getValidJWT };
