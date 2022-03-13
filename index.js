const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

var app = express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(express.json())
  .post('/alchemyhook', (req, res) => { notificationReceived(req); res.status(200).end() })
  .get('/*', (req, res) => res.sendFile('/index.html'))
  .listen(PORT, () => console.log(`Listening on ${PORT}`))

async function addAddress(new_address) {
  console.log("adding address " + new_address);
  const body = { webhook_id: "160886", addresses_to_add: ["0xab5801a7d398351b8be11c439e05c5b3259aec9b"], addresses_to_remove: [] };
  try {
    fetch('http://dashboard.alchemyapi.io/api/update-webhook-addresses', {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
      headers: { 'X-Alchemy-Token': "MQGAOmHJhGwApszvpiqcF4sL9-hRRwmx" }
    })
      .then(res => res.json())
      .then(json => console.log(json));
  }
  catch (err) {
    console.error("An error occured: " + err);
  }
}