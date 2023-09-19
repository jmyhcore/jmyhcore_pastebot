const tmi = require('tmi.js')
const handlers = require('./src/handlers')
const fs = require('fs')
const rawLoginData = fs.readFileSync('./cridentials.json')
const parsedLoginData = JSON.parse(rawLoginData)

const clientOptions = {
    identity: {
        username: parsedLoginData.login,
        password: parsedLoginData.token
    },
    channels: [
        'cptlenivka', 'xhilatreae'
    ]
}

const client = new tmi.client(clientOptions)

client.on('message', async(channel, context, message, self) => {
    if (self) return

    channel = channel.substring(1)
    let reply = await handlers.messageHandler(channel, context, message)
    

    if (reply) client.say(channel, reply)
})
client.on('connected', handlers.connectionHandler)

client.connect();