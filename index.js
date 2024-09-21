// Import necessary libraries
const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField } = require('discord.js');
const os = require('os');
const disk = require('diskusage');
const path = require('path');
const { setupAntiNuke } = require('./antinuke');  // Import the anti-nuke system

// Create a new Discord client instance
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]
});

// Replace with your bot token
const TOKEN = 'YOUR_BOT_TOKEN_HERE';

// Replace with the bot owner's information
const OWNER_NAME = 'Your Name';
const OWNER_ID = 'YOUR_DISCORD_ID';

// Set command prefix
const PREFIX = '!';  // You can change this to any prefix you want

// When the bot is ready
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    setupAntiNuke(client);  // Setup the anti-nuke system
});

// Command handling and other bot logic goes here...
// ...

// Log in to Discord
client.login(TOKEN);
