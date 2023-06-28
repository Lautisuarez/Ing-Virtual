const { createProvider } = require('@bot-whatsapp/bot')
const JsonFileAdapter = require('@bot-whatsapp/database/json')
const { config } = require('dotenv')
const MetaProvider = require('./Utility/meta.js')
const { ChatGPTClass } = require("./Utility/ChatGTP.js")

config() // Configuracion de dotenv

// --------------------- MAIN ---------------------
const createBotGPT = async ({provider,database}) => new ChatGPTClass(database, provider);

const main = async () => {
    const adapterDB = new JsonFileAdapter()
    const adapterProvider = createProvider(MetaProvider, {
        jwtToken: process.env.WSP_API_TOKEN,
        numberId: process.env.ID_BOT,
        verifyToken: process.env.VERIFY_TOKEN,
        version: 'v16.0',
    })
   createBotGPT({
        provider: adapterProvider, 
        database: adapterDB
    })
}

main()
