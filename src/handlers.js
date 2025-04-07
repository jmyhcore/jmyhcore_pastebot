const config = require('./config')
const db = require('./sql')
cooldowns = {
    pasta: 0,
    blockedPastaIdList: [],
    archive: 0
}

const messageHandler = async (channel, context, message) => {
    return new Promise(async resolve => {
        message = message.split(' ')
        let command = message.shift().toLowerCase()
        message = message.join(' ')

        let result = null
        let error = null

        if (!config.excludeChannels.indexOf(channel)) {
            if (config.commands.pasta.trigger.indexOf(command) > -1) result = await pasta(context.mod)
            if (config.commands.archive.trigger.indexOf(command) > -1) result = archive(channel, context, message)
        }

        if (!result) result = null
        if (error) resolve('error')
        else resolve(result)
    })

}

const tmiConnectionHandler = (addr, port) => {
    console.log(`connected to ${addr}:${port}`)
}

pasta = async (isModerator) => {
    return new Promise(async (resolve) => {
        if ((Date.now - cooldowns.pasta) < config.commands.pasta.cooldown && !isModerator) {
            resolve(null)
            return
        }
        cooldowns.pasta = Date.now()

        result = await db.getRandomPasta(cooldowns.blockedPastaIdList.length > 0 ? cooldowns.blockedPastaIdList : null)
        if (result[0]) resolve('error')
        else {
            if (cooldowns.blockedPastaIdList.length > 9) cooldowns.blockedPastaIdList.shift()

            cooldowns.blockedPastaIdList.push(result[1].id)
            resolve(result[1].content)
        }
    })
}

archive = async (channel, context, message, weight = 1000) => {
    return new Promise(async (resolve) => {
        if (context.mod || context.subscriber || context.badges.broadcaster == '1' || context.badges.vip == '1') {
            result = await db.archive(channel, context.username, message, weight)
            if (result[0]) resolve('error')
            else resolve('ПАСТА добавлена')
        } else resolve('ПАСТА не добавлена. ПАСТЫ могут добавить только сабскрэмбо')
    })
}



module.exports = {
    messageHandler, tmiConnectionHandler, pasta, archive
}