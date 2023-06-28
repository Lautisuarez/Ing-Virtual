const { CoreClass } = require('@bot-whatsapp/bot')
const { Configuration, OpenAIApi } = require('openai')
const { conversationArray } = require('./conversation.js')

// -------------- CLASE --------------
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

module.exports = { ChatGPTClass };