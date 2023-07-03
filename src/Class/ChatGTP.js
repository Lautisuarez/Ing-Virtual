const { CoreClass } = require('@bot-whatsapp/bot')
const { Configuration, OpenAIApi } = require('openai')
const { conversationArray } = require('../Utility/conversation.js')

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
        let parseMessage = "";
        // Traemos la respuesta de la IA
        if(body.toLowerCase().includes('imagen:')){
            // Si el usuario pide una imagen
            const bodyFilter = body.toLowerCase().replace('imagen:', '');
            response = await this.openai.createImage({
                prompt: bodyFilter,
                n: 1,
                size: "1024x1024"
            })  
            parseMessage = {
                completion,
                answer: "Imagen",
                options: {
                    media: response.data.data[0].url
                }
            };
        } else {
            // Si el usuario pide una respuesta de texto
            response = await this.openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages: conversationArray,
            })  
            conversationArray.push(response.data.choices[0].message)
            completion = response.data.choices[0].message.content;
            parseMessage = {
                completion,
                answer: completion
            };
            this.queu.push(completion);
        }
        // Enviamos el mensaje
        this.sendFlowSimple([parseMessage], from)
    }
}

module.exports = { ChatGPTClass };