async function test() {
  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=1&q=is:inbox", {
    headers: { Authorization: `Bearer invalid_token` }
  });
  const data = await res.json();
  console.log("Data:", JSON.stringify(data, null, 2));
}
test();
