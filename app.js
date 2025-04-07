const tmi = require('tmi.js')
const handlers = require('./src/handlers')
const webhandlers = require('./src/webhandlers')
const Timer = require('./src/timers')
const conf = require('./src/config')

const express = require('express')
const app = express()
const bodyparser = require('body-parser')

app.use(bodyparser.urlencoded({ extended: true }))
app.use(express.json())

const clientOptions = {
    identity: {
        username: conf.username,
        password: conf.token
    },
    channels: conf.channels
}

const client = new tmi.client(clientOptions)
let timer = new Timer(client)
timer.init()

client.on('message', async(channel, context, message, self) => {
    if (self) return
    channel = channel.substring(1)
    let reply = await handlers.messageHandler(channel, context, message)
    
    if (reply) client.say(channel, reply)
})

client.on('connected', handlers.tmiConnectionHandler)
client.connect();


app.post('/register', webhandlers.register)
app.post('/authorize', webhandlers.authByPassword)

app.post('/paste/channellist', webhandlers.verifyToken, (req, res) => {res.json(conf.channels)})
app.post('/paste/new', webhandlers.verifyToken, webhandlers.newPaste)
app.post('/paste/list', webhandlers.verifyToken, webhandlers.pasteList)
app.post('/paste/delete', webhandlers.verifyToken, webhandlers.deletePaste)
app.post('/paste/update', webhandlers.verifyToken, webhandlers.updatePaste)
app.post('/paste/send', webhandlers.verifyToken, (req, res) => webhandlers.sendpaste(req, res, client))
app.get('/', (req, res) => res.sendFile(__dirname+'/front/index.html'))

app.listen(80)