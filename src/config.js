const fs = require('fs')
const conf = fs.readFileSync('./conf.json')


module.exports = JSON.parse(conf)