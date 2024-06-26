const { client } = require("../../../helpers/redis")

exports.saveAccessKey = async (publicKey, jti, user_id, exp = 600) => {
    try {
        const key = jti + '@' + user_id + 'AccessToken'
        const content = {
            publicKey: publicKey
        }

        await client.set(key, JSON.stringify(content))
        await client.expire(key, parseInt(exp))
    } catch (error) {
        console.log(error)
        return false
    }
}

exports.getAccessKey = async (jti, user_id) => {
    try {
        const key = jti + '@' + user_id + 'AccessToken'
        const value = await client.get(key)
        const content = JSON.parse(value)

        if (content == null)
            return false

            return content.publicKey
    } catch (error) {
        console.log(error)
        return false
    }
}

exports.destroyAccessToken = async (jti, user_id) => {
    try {
        const key = jti + '@' + user_id + 'AccessToken'

        await client.del(key)
        return true
    } catch (error) {
        console.log(error)
        return false
    }
}

exports.destroyRefreshToken = async (jti, user_id) => {
    try {
        const key = jti + '@' + user_id + 'RefreshToken'

        await client.del(key)
        return true
    } catch (error) {
        console.log(error)
        return false
    }
}

exports.saveRefreshKey = async (publicKey, jti, user_id, exp = 604800) => {
    try {
        const key = jti + '@' + user_id + 'RefreshToken'
        const content = {
            publicKey: publicKey,
        }

        await client.set(key, JSON.stringify(content))
        await client.expire(key, parseInt(exp))
    } catch (error) {
        console.log(error)
        return false
    }
}

exports.getRefreshKey = async (jti, user_id) => {
    try {
        const key = jti + '@' + user_id + 'RefreshToken'
        const value = await client.get(key)
        const content = JSON.parse(value)

        if (content == null)
            return false

        return content.publicKey
    } catch (error) {
        console.log(error)
        return false
    }
}

// for avoid ddos purpose
exports.countKeyNumber = async (user_id) => {
    try {
        const arrOfRefreshKey = await client.keys(`*@${user_id}RefreshToken`)

        return arrOfRefreshKey.length
    } catch (error) {
        console.log(error)
        return 0
    }
}

exports.destroyAllKey = async (user_id) => {
    try {
        // delete all refresh key
        const arrOfRefreshKey = await client.keys(`*@${user_id}RefreshToken`)
        arrOfRefreshKey.forEach(async (key) => {
            await client.del(key)
        })

        const arrOfAccessKey = await client.keys(`*@${user_id}AccessToken`)
        arrOfAccessKey.forEach(async (key) => {
            await client.del(key)
        })

        return true
    } catch (error) {
        console.log(error)
        return false
    }
}