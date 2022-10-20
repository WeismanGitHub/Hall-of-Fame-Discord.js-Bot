const { Client, Intents } = require('discord.js');
const WOKCommands = require('wokcommands');
const mongoose = require('mongoose');
const express = require('express');
const log = require('log-to-file');
const path = require('path');
require('dotenv').config();

const client = new Client({
    intents: [
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_VOICE_STATES
    ]
});

const app = express();
const port = 5000;

//The reason for making it a web app is because replit requires that.
app.get('/', (req, res) => {
    const isOnline = client?.user?.presence?.status == 'online'

    if (!isOnline) {
        client.login(process.env.TOKEN);
    }

    res.status(200)
    .send('online...')
});

app.listen(port, () => console.log(`server listening on port ${port}...`));

client.on("ready", async () => {
    client.user.setActivity('Use /help for help.');

    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(console.log('connected to database...'));
    
	new WOKCommands(
        client, {
            commandsDir: path.join(__dirname, './commands'),
            featuresDir: path.join(__dirname, './features'),
            testServers: [process.env.TEST_GUILD_ID],
            botOwners: [process.env.MAIN_ACCOUNT_ID],
            disabledDefaultCommands: ['prefix', 'language'],
            mongoUri: process.env.MONGO_URI,
    });

	console.log('logged in...');
});

process.on('uncaughtException', function (error) {
    log(`Time: ${new Date}\n${error}\n`, 'error.log');
    console.log(new Date, error)
});

process.on('unhandledRejection', error => {
    log(`Time: ${new Date}\n${error}\n`, 'error.log');
    console.log(new Date, error)
});

client.login(process.env.TOKEN);