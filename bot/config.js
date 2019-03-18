const fs = require('fs')
var config = fs.readFileSync('config.json', 'utf8')
config = JSON.parse(config)
console.log(config)

module.exports = config
