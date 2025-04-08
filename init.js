const fs = require('fs')
let config = {}
changesWereMadeFlag = false
try {
    const configfile = fs.readFileSync('./conf.json')
    config = JSON.parse(configfile)
    console.log('config file was found...')
} catch(e) {
    changesWereMadeFlag = true
    console.log('config file was not found... Initializing')
    fs.writeFileSync('./conf.json', '')
}

if (!config.username) {
    changesWereMadeFlag = true
    config.username = 'your bot username here'
    console.log('config.username should be filled')
}

if (!config.token) {
    changesWereMadeFlag = true
    config.token = `your bot's oauth here`
    console.log('config.token should be filled')
}

if (!config.channels || !Array.isArray(config.channels)) {
    changesWereMadeFlag = true
    if (typeof config.channels == 'string') {
        console.log('attempting to fix config.channels - should be array, was string with value', config.channels)
        config.channels = [config.channels]
        return
    }
    config.channels = ['your', 'desired', 'channels', 'here']
    console.log('config.channels should be filled')
}

if (!config.excludeChannels || !Array.isArray(config.excludeChannels)) {
    changesWereMadeFlag = true
    if (typeof config.excludeChannels == 'string') {
        console.log('attempting to fix config.excludeChannels - should be array, was string with value', config.excludeChannels)
        config.channels = [config.excludeChannels]
        return
    }
    config.excludeChannels = ['your', 'desired', 'channels', 'here']
    console.log('config.excludeChannels should be filled')
}

if (!config.commands) {
    changesWereMadeFlag = true
    config.commands = {
        pasta : {
            trigger: ['!паста', '!pasta', '!капча'],
            cooldown: 30000
        },
        archive: {
            trigger: ['!archive'],
            cooldown: 0
        }
    }
    console.log('config.commands was reset to default')
}

if (changesWereMadeFlag) fs.writeFileSync('./conf.json', JSON.stringify(config, null, 4))
else console.log('config file signature OK\nDont forget to fill it(./conf.json)')