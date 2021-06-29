const { Client } = require("cassandra-driver")

const client = new Client({
    cloud: {
        secureConnectBundle: process.env.PATH_SECURE_CONNECT_BUNDLE
    },
    credentials: {
        username: process.env.CLIENT_ID,
        password: process.env.CLIENT_SECRET
    }
})
client.connect()
console.log("Astra DB connected!")

module.exports = {
    client
}