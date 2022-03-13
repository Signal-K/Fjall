// Add an address to a notificatio in Alchemy

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