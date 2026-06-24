import { Client, Account, Databases } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://api.vela.nafen.sbs/v1")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "69bdb28e003c4db80f0a");

const account = new Account(client);
const databases = new Databases(client);

export { client, account, databases };
