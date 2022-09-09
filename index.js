const GuildSchema = require('./schemas/guild_schema');
const WOKCommands = require('wokcommands');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const express = require('express');
const app = express();
const port = 5000;

//The reason for making it a web app is because replit requires that.
app.get('/', (req, res) => res.send('Hall of Fame Bot is online.'));

app.listen(port, () => console.log(`Started!`));

const {
    Client,
    Intents,
} = require('discord.js');

const client = new Client({
    intents: [
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_VOICE_STATES
    ]
});

client.on("ready", async () => {
    client.user.setActivity('Use /help for help.');

    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(console.log('connected to database...'));
    
	new WOKCommands(
        client,
        {
            commandsDir: path.join(__dirname, './commands'),
            testServers: [process.env.TEST_GUILD_ID],
            botOwners: [process.env.MAIN_ACCOUNT_ID],
            mongoUri: process.env.MONGO_URI
        });

	console.log('logged in...');
});

client.on('guildCreate', async guild => {
    const guildId = guild.id;
    const guildRegistered = await GuildSchema.exists({guildId: guildId})

    if (!guildRegistered) {
        await GuildSchema.create({guildId: guildId});
    }
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

client.login(process.env.TOKEN);