const { client } = require("../../../helpers/redis")

// nên expire trong 24h
exports.markedUser = async (user_id) => {
    try {
        const key = 'marked_user@' + user_id
        const content = {
            is_checked: 0,
            checked_at: 0,
            last_2FA_at: null,
        }

        await client.set(key, JSON.stringify(content))
        return true
    } catch (error) {
        console.log(error)
        return false
    }
}

exports.getMarkedUser = async (user_id) => {
    try {
        const key = 'marked_user@' + user_id
        const value = await client.get(key)
        const content = JSON.parse(value)

        return content
    } catch (error) {
        console.log(error)
        return false
    }
}

exports.unMarkedUser = async (user_id, fingerprint) => {
    try {
        const key = 'marked_user@' + user_id
        const content = {
            is_checked: 1,
            checked_at: Math.round(new Date().getTime()/1000),
            last_2FA_at: fingerprint,
        }
        const exp = process.env.UNMARKED_EXP || 604800

        await client.set(key, JSON.stringify(content))
        await client.expire(key, parseInt(exp))
        return true
    } catch (error) {
        console.log(error)
        return false
    }
}