const config = {
    captchaWeb: {
        enabled: false,
        webHost: '127.0.0.1',
        webPort: 1488
    },
    vk: {
        token: "",
        apiVersion: 5.92,
        lpVersion: 3,
        admins: []
    },
    whitelist: {
        enabled: false,
        type: "friendlist+manual", // Доступные типы: friendlist, manual; можно применять несколько, разделяя '+'. Например: friendlist+manual
        manual: []
    },
    packs: {
        enabled: true,
        list: { // Задается автор альбома в ownerId и ID альбома в albumId
            "bream": {
                ownerId: -171520150,
                albumId: 261312311
            }
        }
    }
}

module.exports = config
