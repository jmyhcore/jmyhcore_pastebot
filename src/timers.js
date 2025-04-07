const db = require('./sql')

class Timer {
    constructor(client) {
        this.client = client

    }

    init = async() => {
        return new Promise(async(resolve) => {
            let data = await db.getTimerList()
            let userIntervals = await db.getAllTimerUsers()

            this.channelPastes = {}
            userIntervals.forEach(item => {
                this.channelPastes[item.login] = {
                    pasteList: [],
                    pasteInterval: item.pasteinterval,
                    iterator: 0,
                    interval: null
                }
            })

            data.forEach(item => {
                if (this.channelPastes[item.channel]) {
                    this.channelPastes[item.channel].pasteList.push(item.pasta)
                }
            })

            for(let channel in this.channelPastes) {

                this.channelPastes[channel].interval = setInterval( () => {
                    this.client.say(channel, this.channelPastes[channel].pasteList[this.channelPastes[channel].iterator])
                    this.channelPastes[channel].iterator++
                    if (this.channelPastes[channel].iterator >= (this.channelPastes[channel].pasteList.length))
                        this.channelPastes[channel].iterator = 0
                }, this.channelPastes[channel].pasteInterval)
            }
        })
    }
}

module.exports = Timer