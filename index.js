require('dotenv').config(); //initialize dotenv
const db = require('./db');
const ai = require('./ai');
const { Events, GatewayIntentBits } = require('discord.js');
const Discord = require('discord.js'); //import discord.js

// Get the keys
const {
    OPENAI_API_KEY, 
    AI_MODEL, 
    DISCORD_TOKEN, 
    AI_COMMAND_NAME, 
    AI_CHANNEL, 
    CONTENT_EMOJI
} = process.env;

// Create a new Discord client here and connect to it
const client = new Discord.Client({
    intents: [
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.Guilds
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}, id ${client.user.id}!`);
});

// respond to all messages here
client.on('messageCreate', async msg => {
    // wrap in try-catch just in case
    try {
        // don't respond to bot messages
        if (msg.author.bot) {
            return;
        }

        // don't respond to messages outside of designated spam channel
        if (msg.channel.name !== AI_CHANNEL) {
            return;
        }

        let message = msg.content;
        if (message.startsWith(AI_COMMAND_NAME + ' ')) {
            // Checking to see if the user is spamming
            let apiCallsLeft = db.getApiCallsLeft(msg.author.id);
            console.log(`User has ${apiCallsLeft} API calls remaining.`)
            if (apiCallsLeft <= 0) {
                return;
            }

            // Call the openAI API and get its output
            let prompt = message.substring(4);
            let responseMessage = await ai.callOpenApi(prompt, AI_MODEL, OPENAI_API_KEY);

            msg.reply(responseMessage);
        } 
    } catch (e) {
        try {
            reaction_orig.message.reply("Sorry, an internal error has occurred. Try again later.");
        } catch (x) {
            console.log('An error has occurred, and I can\'t send messages.');
        }
    }     
});

client.on(Events.MessageReactionAdd, async (reaction_orig, user) => {
    // wrap in try-catch just in case
    try {
        // content moderation on :ParentalAdvisory: emote
        if (reaction_orig['_emoji'].name === CONTENT_EMOJI) {
            let prompt = reaction_orig.message.content;
            console.log("Checking the message '" + prompt + "'");

            let responseMessage = await ai.checkModeration(prompt, OPENAI_API_KEY);

            reaction_orig.message.reply(responseMessage);
        }
    } catch (e) {
        try {
            reaction_orig.message.reply("Sorry, an internal error has occurred. Try again later.");
        } catch (x) {
            console.log('An error has occurred, and I can\'t send messages.');
        }
    }
});

// log in to discord using Discord token
client.login(DISCORD_TOKEN); //login bot using token