require('dotenv').config(); //initialize dotenv
const { GatewayIntentBits } = require('discord.js');
const Discord = require('discord.js'); //import discord.js

const client = new Discord.Client({
    intents: [
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.Guilds
    ]
}); //create new client

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', msg => {
    console.log('Message received')
    // console.log(msg)
    if (msg.content === 'ping') {
        msg.reply('Pong!');
    }
});

//make sure this line is the last line
client.login(process.env.DISCORD_TOKEN); //login bot using token