const { createProvider, CoreClass } = require('@bot-whatsapp/bot')
const { config } = require('dotenv')
const MetaProvider = require('@bot-whatsapp/provider/meta')
const JsonFileAdapter = require('@bot-whatsapp/database/json')
const { Configuration, OpenAIApi } = require('openai')
const { conversationArray } = require('./conversation.js')

// --------------------- INICIALIZAMOS DOTENV ---------------------
config()

// --------------------- CHAGPT CLASE ---------------------
const ChatGPTClass = class extends CoreClass {
    queu = [];
    optionsGPT = { model:"gpt-3.5-turbo" };
    openai = undefined;

    constructor(_database, _provider){
        super(null, _database, _provider);
        this.init().then()
    }

    init = async () => {
        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY
        })
        this.openai = new OpenAIApi(configuration);
    }

    handleMsg = async (msg) => {
        const {from, body} = msg;
        // Guardamos la pregunta del usuario
        conversationArray.push({ 
            role: 'user',
            content: body
        })
        let response = "";
        let completion = "";
        // Traemos la respuesta de la IA
        if(body.toLowerCase().includes('imagen:')){
            response = await this.openai.createImage({
                prompt: body,
                n: 2,
                size: "1024x1024"
            })  
            completion = "Imagen 1: " + response.data.data[0].url + "\nImagen 2: " + response.data.data[1].url;
        } else {
            response = await this.openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages: conversationArray,
            })  
            conversationArray.push(response.data.choices[0].message)
            completion = response.data.choices[0].message.content;
        }
        
        this.queu.push(completion);

        const parseMessage = {
            ...completion,
            answer: completion
        };
        this.sendFlowSimple([parseMessage], from)
    }
}

// --------------------- CODIGO APP.JS ---------------------
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
