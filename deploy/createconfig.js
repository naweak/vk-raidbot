const prompt = require('prompt-sync')();
const fs = require('fs')

function isYes (answer) {
	const yesAnswers = [ 'y', 'д', 'yes', 'да', '' ]
	return yesAnswers.indexOf(answer.toLowerCase()) > -1
}

const reconfigure = prompt('Переконфигурировать? (Y/n) ')

if (isYes(reconfigure)) {
	fs.readFile('config.example.json', (err, data) => {
		if (err) {throw err}
		var serverConfig = data
		serverConfig = JSON.parse(serverConfig)
		const enableWeb = prompt('Включить веб-интерфейс? (Y/n) ')
		serverConfig.captchaWeb.enabled = isYes(enableWeb)
		if (isYes(enableWeb)) {
			const webHost = prompt('Веб-хост: ', '127.0.0.1')
			serverConfig.captchaWeb.webHost = webHost
			const webPort = prompt('Веб-порт: ', '1488')
			serverConfig.captchaWeb.webPort = webPort
		}
		const token = prompt('Токен вк: ')
		serverConfig.vk.token = token
		const apiVersion = prompt('Версия API (5.92): ', 5.92)
		serverConfig.vk.apiVersion = apiVersion
		const lpVersion = prompt('Версия LongpollAPI (3): ', 3)
		serverConfig.vk.lpVersion = lpVersion
		var admins = prompt('Админы бота (через запятую, без пробелов): ')
		admins = admins.split(',')
		admins.forEach((item, index) => {
			admins[index] = Number(item)
		})
		serverConfig.vk.admins = admins
		const enableWhitelist = prompt('Включить вайтлист? (Y/n) ')
		serverConfig.whitelist.enabled = isYes(enableWhitelist)
		if (isYes(enableWhitelist)) {
			const whitelistType = prompt('Тип вайтлиста (friendlist+manual): ', 'friendlist+manual')
			serverConfig.whitelist.type = whitelistType
		}
		const packsEnabled = prompt('Включить паки картинок? (Y/n): ')
		serverConfig.packs.enabled = isYes(packsEnabled)
		const serverConfigJSON = JSON.stringify(serverConfig, null, 2)
		fs.writeFile('../bot/config.json', serverConfigJSON, (err) => {
			if (err) {throw err}
			fs.readFile('webconfig.example.json', (err, data) => {
				if (err) {throw err}
				if (serverConfig.captchaWeb.enabled) {
					var frontendConfig = JSON.parse(data)
					const apiURL = prompt('URL WebAPI (http://127.0.0.1:1488/api): ', 'http://127.0.0.1:1488/api')
					frontendConfig.apiURL = apiURL
					const frontendConfigJSON = JSON.stringify(frontendConfig, null, 2)
					fs.readFile('../www/src/services/Config.example.js', "utf8", (err, data) => {
						if (err) {throw err}
						frontendConfigExample = data
						frontendConfigExample = frontendConfigExample.replace("{json}", frontendConfigJSON)
						fs.writeFile('../www/src/services/Config.js', frontendConfigExample, (err) => {
							if (err) {throw err}
						})
					})
				}
			})
		})
	})
}