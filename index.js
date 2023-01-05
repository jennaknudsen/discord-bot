require('dotenv').config(); //initialize dotenv
const db = require('./db');
const ai = require('./ai');
const { Events, GatewayIntentBits } = require('discord.js');
const Discord = require('discord.js'); //import discord.js

// Get the keys
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const AI_MODEL = process.env.AI_MODEL;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const AI_COMMAND_NAME = process.env.AI_COMMAND_NAME;
const AI_CHANNEL = process.env.AI_CHANNEL;
const CONTENT_EMOJI = process.env.CONTENT_EMOJI;

let escapeDiscordMessage = function(input) {
    return input.replaceAll('*', '\\*')
        .replaceAll('_', '\\_')
        .replaceAll('`', '\\`')
        .replaceAll('>', '\\>');
}

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


    // send "Bot restarted" message in each AI-spam channel
    let guilds = client.guilds.cache;
    guilds.forEach(guild => {
        let channels = guild.channels.cache.map(channel => ({
            name: channel.name,
            id: channel.id
        }));
        let aiChannels = channels.filter(channel => channel.name === AI_CHANNEL);
        aiChannels.forEach(aiChannel => {
            console.log(client.channels);
            client.channels.cache.get(aiChannel.id).send(
                escapeDiscordMessage("OpenAI bot has been restarted.")
            );
        });
    });
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

            msg.reply(escapeDiscordMessage(responseMessage));
        } 
    } catch (e) {
        try {
            reaction_orig.message.reply(escapeDiscordMessage("Sorry, an internal error has occurred. Try again later."));
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

            reaction_orig.message.reply(escapeDiscordMessage(responseMessage));
        }
    } catch (e) {
        try {
            reaction_orig.message.reply(escapeDiscordMessage("Sorry, an internal error has occurred. Try again later."));
        } catch (x) {
            console.log('An error has occurred, and I can\'t send messages.');
        }
    }
});
// log in to discord using Discord token
client.login(DISCORD_TOKEN); //login bot using token