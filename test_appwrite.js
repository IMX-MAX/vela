const { Client } = require('node-appwrite');
try {
  const adminClient = new Client()
    .setEndpoint('https://api.nafen.sbs/v1')
    .setProject('69bdb28e003c4db80f0a')
    .setKey(process.env.MISSING_KEY);
  console.log("No error!");
} catch (err) {
  console.log("Error!", err.message);
}
