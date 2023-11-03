let api = 'http://120.53.94.114:8080/'

function adornUrl (path) {
    return api + path
}

function generateUUID () {
    let d = new Date().getTime()
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = (d + Math.random() * 16) % 16 | 0
        d = Math.floor(d / 16)
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16)
    })
    return uuid
}

function getCurrentDateTime () {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')

    const dateTimeString = `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`
    return dateTimeString
}

function sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export default {
    adornUrl, generateUUID, getCurrentDateTime, sleep
}
