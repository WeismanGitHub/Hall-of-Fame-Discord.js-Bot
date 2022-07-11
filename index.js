const GuildSchema = require('./schemas/guild-schema');
const WOKCommands = require('wokcommands');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => res.send('Hall of Fame Bot is online.'));

app.listen(port, () => console.log(`Started!`));

const {
    Client,
    Intents,
} = require('discord.js');

const client = new Client({
    intents: [
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILDS,
    ]
});

client.on("ready", async () => {
    client.user.setActivity('Being worked on!');
    
    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(console.log('connected to database...'));
    
	new WOKCommands(
        client,
        {
            commandsDir: path.join(__dirname, './commands'),
            testServers: ['746671609909346395'],
            botOwners: ['745191242970824735', '630250251571298324'],
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