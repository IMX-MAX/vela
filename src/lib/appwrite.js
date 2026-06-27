import { Client, Account, Databases } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://api.nafen.sbs/v1")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "69bdb28e003c4db80f0a");

const account = new Account(client);
const databases = new Databases(client);

let cachedJWT = null;
let jwtExpiry = null;

let jwtLock = null;

async function getValidJWT() {
  if (cachedJWT && jwtExpiry && Date.now() < jwtExpiry) {
    return cachedJWT;
  }
  
  if (jwtLock) {
    return jwtLock;
  }
  
  jwtLock = (async () => {
    try {
      const response = await account.createJWT();
      cachedJWT = response.jwt;
      jwtExpiry = Date.now() + 13 * 60 * 1000;
      return cachedJWT;
    } finally {
      jwtLock = null;
    }
  })();
  
  return jwtLock;
}

export { client, account, databases, getValidJWT };
