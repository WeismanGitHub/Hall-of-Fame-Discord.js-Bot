const { Client, Intents } = require('discord.js');
const WOKCommands = require('wokcommands');
const app = require('./web-dashboard/app')
const mongoose = require('mongoose');
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

const port = process.env.PORT || 5000
app.listen(port || 5000, () => console.log(`listening on port ${port}...`));

client.on("ready", async () => {
    app.set('client', client)
    client.user.setActivity('Use /help for help.');

    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(console.log('connected to database...'));
    
	new WOKCommands(
        client, {
            commandsDir: path.join(__dirname, './commands'),
            featuresDir: path.join(__dirname, './events'),
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

module.exports = client