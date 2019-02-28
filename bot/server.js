// Modules
var config = require('./config.js')
var axios = require('axios')
var shellExec = require('shell-exec')
var { stringify } = require('querystring')
var express = require('express')
var fs = require('fs')

// API params
var vkEndpoint = 'https://api.vk.com/method'
var access_token = config.vk.token
var v = config.vk.apiVersion
var lp_version = config.vk.lpVersion

// Misc
var admins = config.vk.admins

function getRandomId () {
    return Math.floor(Math.random() * 1000000000000)
}

function isAdmin (id) {
    return admins.indexOf(id) != -1
}

function updateHandle (update) {
    console.log(update)
    if (update[0] == 4) {
        var peerId = update[3]
        var message = update[5]
        var fromId
        if (update[6] && update[6]['from']) {
            fromId = update[6]['from']
        }
        else {
            fromId = peerId
        }
        fromId = Number(fromId)
        console.log(admins)
        var issueRexp = new RegExp('^\.issue (.+)', 'i')
        var issueMatches = issueRexp.exec(message)
        var nodeRexp = new RegExp('^\.(node(js){0,1}|js) (.+)', 'i')
        var nodeMatches = nodeRexp.exec(message)
        if (issueMatches && isAdmin(fromId)) {
            var command = issueMatches[1]
            command = command.replace('»', '>>')
            command = command.replace('—', '--')
            shellExec(command).then(out => {
                if (out.stdout)
                    result = out.stdout
                else
                    result = out.stderr
                axios.post(`${vkEndpoint}/messages.send`, stringify({
                    access_token,
                    v,
                    message: result,
                    random_id: getRandomId(),
                    peer_id: peerId
                })).then(console.log).catch(console.log)
            })
        }
        else if (nodeMatches && isAdmin(fromId)) {
            console.log(nodeMatches)
            var code = nodeMatches[3]
            code = code.replace('»', '>>')
            code = code.replace('—', '--')
            code = code.replace('<br>', '\n')
            fs.writeFile('exec.js', code, e => {
                if (e)
                    console.log(e)
            })
            shellExec('node exec.js').then(out => {
                if (out.stdout)
                    result = out.stdout
                else
                    result = out.stderr
                axios.post(`${vkEndpoint}/messages.send`, stringify({
                    access_token,
                    v,
                    message: result,
                    random_id: getRandomId(),
                    peer_id: peerId
                })).then(console.log).catch(console.log)
            })
        }
    }
}

function startPolling (server, ts) {
    axios.get(`https://${server.server}?act=a_check&key=${server.key}&ts=${ts}&wait=25&mode=2&version=2`).then(response => {
        if (!response.data.failed) {
            let updates = response.data.updates
            updates.forEach((update, key) => {
                updateHandle(update)
            })
            startPolling(server, response.data.ts)
        }
        else if (response.data.failed) {
            let fail = response.data.failed
            switch (fail) {
                case 1:
                    startPolling(server, response.data.ts)
            }
        }
    }).catch(console.log)
}

// Entry point
function main () {
    axios.get(`${vkEndpoint}/messages.getLongPollServer`, {
        params: {
            access_token,
            v,
            lp_version
        }
    }).then(response => {
        console.log('Бот запущен')
        var server = response.data.response
        startPolling(server, server.ts)
    }).catch(console.log)
    if (config.captchaWeb.enabled) {
        var webServer = new Promise((resolve, reject) => {
            var app = express()
            var host = config.captchaWeb.webHost
            var port = config.captchaWeb.webPort
            app.use('/', express.static('../www'))
            app.listen(port, host, () => console.log(`Вёб-интерфейс запущен на ${host}:${port}`))
        })
    }
}

main()
