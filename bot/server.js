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
var intervals = []
var captchas = []
var whitelist = []

function removeCaptcha (sid) {
    captchas.forEach((element, index) => {
        if (element.sid == sid) {
            captchas.splice(index, 1)
        }
    })
}

function getRandomId () {
    return Math.floor(Math.random() * 1000000000000)
}

function isAdmin (id) {
    return admins.indexOf(id) != -1
}

function log (data) {
    console.log(data)
    if (typeof data == 'object') {
        try {
            data = JSON.stringify(data)
        }
        catch (e) {}
    }
    fs.appendFile('log.txt', `[${Date.now()}] ` + data + '\n', err => {
        err ? console.log(err) : true
    })
}

function getWhitelist () {
    if (config.whitelist.enabled) {
        let whitelistTypes = config.whitelist.type
        whitelistTypes = whitelistTypes.split('+')
        if (whitelistTypes.indexOf('friendlist') > -1) {
            axios.get(`${vkEndpoint}/friends.get`, {
                params: {
                    access_token,
                    v,
                    count: 10000,
                    offset: 0
                }
            }).then(response => {
                if (response.data.response) {
                    whitelist = whitelist.concat(response.data.response.items)
                    log('Список друзей получен')
                }
                else {
                    log(response.data.error)
                }
            })
        }
        if (whitelistTypes.indexOf('manual') > -1) {
            whitelist = whitelist.concat(config.whitelist.manual)
            log('Получены вручную заданные ID')
        }
    }
}

getWhitelist()

function inWhiteList (fromId) {
    log(whitelist)
    return !config.whitelist.enabled || whitelist.indexOf(fromId) > -1
}

function raid (peer, message, msDelay = 3000, attach = []) {
    log('Рейд')
    var intervalName = getRandomId()
    intervals.push(setInterval(() => {
        axios.post(`${vkEndpoint}/messages.send`, stringify({
            peer_id: peer,
            message,
            attachment: attach.join(','),
            access_token,
            v,
            random_id: getRandomId()
        })).then(response => {
            log(response.data)
            if (response.data.error) {
                var apiError = response.data.error
                switch (apiError['error_code']) {
                    case 14: // Captcha handle
                        captchas.push({
                            img: apiError['captcha_img'],
                            sid: apiError['captcha_sid']
                        })
                        for (interval in intervals) {
                            interval = intervals[interval]
                            clearInterval(interval)
                        }
                }
            }
        })
    }, msDelay))
}

function updateHandle (update) {
    log(update)
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
        log(admins)
        var issueRexp = new RegExp('^\.issue (.+)', 'i')
        var issueMatches = issueRexp.exec(message)
        var nodeRexp = new RegExp('^\.(node(js){0,1}|js) (.+)', 'i')
        var nodeMatches = nodeRexp.exec(message)
        var raidRexp = new RegExp("^\.raid {'(.+)'} (.+)", 'i')
        var raidMatches = raidRexp.exec(message)
        var joinRexp = new RegExp("^\.join (.+)", 'i')
        var joinMatches = message.match(joinRexp)
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
                })).then(log).catch(log)
            })
        }
        else if (nodeMatches && isAdmin(fromId)) {
            log(nodeMatches)
            var code = nodeMatches[3]
            code = code.replace('»', '>>')
            code = code.replace('—', '--')
            code = code.replace('<br>', '\n')
            fs.writeFile('exec.js', code, e => {
                if (e)
                    log(e)
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
                })).then(log).catch(log)
            })
        }
        else if (raidMatches && inWhiteList(fromId)) {
            var raidData = {
                message: raidMatches[1],
                attachment: raidMatches[2] || ''
            }
            raid(peerId, raidData.message, 500, raidData.attachment.split(','))
        }
        else if (joinMatches && inWhiteList(fromId)) {
            var link = joinMatches[1]
            axios.get(`${vkEndpoint}/messages.joinChatByInviteLink`, {
                params: {
                    access_token,
                    v,
                    link
                }
            }).then(response => {
                log(response)
                if (response.data.error) {
                    axios.post(`${vkEndpoint}/messages.send`, stringify({
                        access_token,
                        v,
                        message: `Ошибка: ${response.data.error['error_msg']}`,
                        random_id: getRandomId(),
                        peer_id: peerId
                    })).then(response => {
                        log(r)
                    }).catch(log)
                }
            }).catch(log)
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
    }).catch(log)
}

function apiRequestHandle (req, res) {
    res.set('Access-Control-Allow-Origin', '*')
    switch (req.query.method) {
        case "getCaptchas":
            res.send({
                success: captchas
            })
            break
        case "submitCaptcha":
            var key = req.query.key
            var sid = req.query.sid
            if (!key) {
                res.send({
                    error: "Введите капчу"
                })
            }
            else if (!sid) {
                res.send({
                    error: "Введите ID капчи"
                })
            }
            else {
                axios.post(`${vkEndpoint}/messages.send`, stringify({
                    peer_id: 2000000001,
                    message: "Введена капча "+sid,
                    access_token,
                    v,
                    random_id: getRandomId(),
                    captcha_key: key,
                    captcha_sid: sid
                })).then(response => {
                    log(response)
                    if (response.data.error) {
                        let error = response.data.error
                        res.send({
                            error: "Капча введена неверно или я сука дебил нахуй"
                        })
                    }
                    else {
                        removeCaptcha(sid)
                        res.send({
                            success: "Капча введена верно"
                        })
                    }
                })
            }
            break
        default:
            res.send({
                error: "Метод не существует"
            })
    }
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
        log('Бот запущен')
        var server = response.data.response
        startPolling(server, server.ts)
    }).catch(log)
    if (config.captchaWeb.enabled) {
        var webServer = new Promise((resolve, reject) => {
            var app = express()
            var host = config.captchaWeb.webHost
            var port = config.captchaWeb.webPort
            app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal'])
            app.use('/', express.static('../www'))
            app.get('/api', apiRequestHandle)
            app.listen(port, host, () => log(`Вёб-интерфейс запущен на ${host}:${port}`))
        })
    }
}

main()
