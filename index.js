require('dotenv').config(); //initialize dotenv
const db = require('./db');
const ai = require('./ai');
const { GatewayIntentBits } = require('discord.js');
const Discord = require('discord.js'); //import discord.js

// Create a new Discord client here and connect to it
const client = new Discord.Client({
    intents: [
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.Guilds
    ]
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}, id ${client.user.id}!`);
});

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const AI_MODEL = process.env.AI_MODEL;

// respond to all messages here
client.on('messageCreate', async msg => {
    // don't respond to bot messages
    if (msg.author.bot) {
        return;
    }

    let channel = msg.channel;
    let message = msg.content;
    if (message.startsWith('%ai')) {
        // Checking to see if the user is spamming
        let apiCallsLeft = db.getApiCallsLeft(msg.author.id);
        console.log(`User has ${apiCallsLeft} API calls remaining.`)
        if (apiCallsLeft <= 0) {
            return;
        }

        // Call the openAI API and get its output
        let prompt = message.substring(4);
        let responseMessage = await ai.callOpenApi(prompt, AI_MODEL, OPENAI_API_KEY);

        channel.send(responseMessage);

    } 
});

// log in to discord using Discord token
client.login(process.env.DISCORD_TOKEN); //login bot using token