const tmi = require('tmi.js')
const handlers = require('./src/handlers')
const webhandlers = require('./src/webhandlers')
const Timer = require('./src/timers')

const fs = require('fs')
const rawLoginData = fs.readFileSync('./cridentials.json')
const parsedLoginData = JSON.parse(rawLoginData)

const express = require('express')
const app = express()
const bodyparser = require('body-parser')

app.use(bodyparser.urlencoded({ extended: true }))
app.use(express.json())

const clientOptions = {
    identity: {
        username: parsedLoginData.login,
        password: parsedLoginData.token
    },
    channels: [
        'cptlenivka', 'xhilatreae', 'xelagray' 
    ]
}

const client = new tmi.client(clientOptions)
const timer = new Timer(client)
timer.init()

client.on('message', async(channel, context, message, self) => {
    if (self) return
    channel = channel.substring(1)
    let reply = await handlers.messageHandler(channel, context, message)
    
    if (reply) client.say(channel, reply)
})
client.on('connected', handlers.connectionHandler)

client.connect();

app.post('/register', webhandlers.register)
app.post('/login', webhandlers.login)
app.post('/authtest', webhandlers.verifyToken, (req, res) => {
    res.status(200).send('wellCUM')
})
app.post('/newpaste', webhandlers.verifyToken, webhandlers.newPaste)
app.post('/pastelist', webhandlers.verifyToken, webhandlers.pasteList)
app.post('/delete', webhandlers.verifyToken, webhandlers.deletePaste)
app.post('/update', webhandlers.verifyToken, webhandlers.updatePaste)
app.post('/sendpaste', webhandlers.verifyToken, (req, res) => webhandlers.sendpaste(req, res, client))
app.get('/', (req, res) => res.sendFile(__dirname+'/front/index.html'))

app.listen(80)