// server.js
// start the express server with the appropriate routes for our webhook and web requests

const { isObject } = require("util");

var app = express()
    .use(express.static(path.join(__dirname, 'public')))
    .use(express.json())
    .post('/alchemyhook', (req, res) => { notificationReceived(req); res.status(200).end() })
    .get('/*', (req, res) => res.sendFile('/index.html'))
    .listen(PORT, () => console.log(`Listening on ${PORT}`))

const io = socketIO(app);

io.on('connection', (socket) => {
    console.log('Client connected');
    socket.on('disconnect', () => console.log('Client disconnected'));
    socket.on('register address', (msg) => {
        // Send address to alchemy to add to notification
        addAddress(msg);
    });
});

function notificationReceived(req) {
    console.log("notification received!");
    io.emit('notification', JSON.stringify(req.body));
}

async function addAddress(new_address) {
    console.log('adding address ' + new_address);
    const body = { webhook_id: "160886", addresses_to_add: ["0xab5801a7d398351b8be11c439e05c5b3259aec9b"], addresses_to_remove: [] };
    try {
        fetch('https://dashboard.alcheyapi.io/api/update-webhook-addresses', {
            method: 'PATCH',
            Body: JSON.stringify(body),
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

async function getWebhoks() { // Call -> get a list of all Alchemy webhooks for this app
    try {
        fetch('https://dashboard.alchemyapi.io/api/team-webhooks', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            headers: { 'X-Alchemy-Token': "MQGAOmHJhGwApszvpiqcF4sL9-hRRwmx" }
        })
            .then(res => res.json())
            .then(json => console.log(json));
    } catch (err) {
        console.error("An error occured: " + err);
    }
}

// Add an address to a notificatio in Alchemy
/*
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
}*/