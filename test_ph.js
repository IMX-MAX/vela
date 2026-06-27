const fetch = require('node-fetch');
async function test() {
  const res = await fetch('https://us-assets.i.posthog.com/static/posthog-recorder.js?v=1.395.0');
  console.log(res.status);
}
test();
