require('dotenv').config(); //initialize dotenv
const db = require('./db');
const ai = require('./ai');
const { Events, GatewayIntentBits, MessageType } = require('discord.js');
const Discord = require('discord.js'); //import discord.js

// Get the keys
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const AI_MODEL = process.env.AI_MODEL;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const AI_COMMAND_NAME = process.env.AI_COMMAND_NAME;
const AI_CHANNEL = process.env.AI_CHANNEL;
const CONTENT_EMOJI = process.env.CONTENT_EMOJI;
const AI_TRAINING_DIRECTIONS = process.env.AI_TRAINING_DIRECTIONS

let escapeDiscordMessage = function(input) {
    return input.replaceAll('*', '\\*')
        .replaceAll('_', '\\_')
        .replaceAll('`', '\\`')
        .replaceAll('>', '\\>');
}

// use this function to clean + reply to a message.
// can choose whether to ping a user or not
let replyToMessage = function(msg, content, ping=true) {
    msg.reply({ content: escapeDiscordMessage(content), allowedMentions: { repliedUser: ping }} )
        .catch(e => {
            console.log("Unable to send message.");
            console.log(e);
            replyToMessage(msg, "Sorry, an internal error occurred. Try again later.", ping=ping);
        });
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
    console.log("Bot is active in the following servers:")
    console.log(guilds.map(guild => guild.name));
    guilds.forEach(guild => {
        try {
            let channels = guild.channels.cache.map(channel => ({
                name: channel.name,
                id: channel.id
            }));
            let aiChannels = channels.filter(channel => channel.name === AI_CHANNEL);
            aiChannels.forEach(aiChannel => {
                client.channels.cache.get(aiChannel.id).send(
                    `OpenAI bot has been restarted. Completions model: \`${AI_MODEL}\``
                ).catch(e => {
                    console.log('An error has occurred: ')
                    console.log(e)
                });
            });
        } catch (e) {
            console.log('An error has occurred, and I can\'t send a wakeup message in ' + guild.name);
        };
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
            
            let messageArray = await getMessageChain(msg, []);

            // add training directions 
            messageArray.splice(0, 0, {
                role: 'system',
                content: AI_TRAINING_DIRECTIONS
            });

            console.log("Message array:");
            console.log(messageArray);
            // Call the openAI API and get its output
            // let prompt = message.substring(4);
            // let responseMessage = await ai.callOpenApi(prompt, AI_MODEL, OPENAI_API_KEY);
            let responseMessage = await ai.callOpenApi(messageArray, AI_MODEL, OPENAI_API_KEY);
            replyToMessage(msg, responseMessage)
        } 
    } catch (e) {
        try {
            console.log(e)
            replyToMessage(msg, "Sorry, an internal error occurred. Try again later.")
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

            replyToMessage(reaction_orig.message, responseMessage, ping=false)
        }
    } catch (e) {
        replyToMessage(reaction_orig.message, "Sorry, an internal error has occurred. Try again later.");
    }
});

async function getMessageChain(msg, messageArray) {
    console.log(msg)
    console.log(msg.author.bot)
    let role = null;
    let content = null;
    if (msg.author.bot) {
        role = 'assistant';
        content = msg.content;
    } else {
        // stop recursing when ai command isn't present
        if (!msg.content.startsWith(AI_COMMAND_NAME + ' ')) {
            return messageArray;
        } 
        role = 'user';
        content = msg.content.substring(4);
    }
    let itemToInsert = {
        role: role,
        content: content
    };
    messageArray.splice(0, 0, itemToInsert);

    if (msg.type === MessageType.Reply) {
        // let parentMsg = await msg.channel.messages.fetch(msg.reference.messageID);
        let parentMsg = await msg.fetchReference();
        console.log("PARENT MESSAGE")
        console.log(parentMsg)
        return getMessageChain(parentMsg, messageArray);
    } else {
        return messageArray;
    }
} 

// log in to discord using Discord token
client.login(DISCORD_TOKEN); //login bot using token
