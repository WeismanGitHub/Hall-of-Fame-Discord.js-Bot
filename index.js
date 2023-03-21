const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { loadCommands, loadEvents } = require('./helpers/load');
const connectDB = require('./mongodb-connect')
const app = require('./web-dashboard/app')
const log = require('log-to-file');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates
    ],
});

client.commands = new Collection()
const port = process.env.PORT || 5000
app.set('client', client)

client.on("ready", async () => {
    client.user.setActivity('Use /help for help.');
    console.log('bot is ready...')

    loadCommands(client)
    loadEvents(client)
});

process.on('uncaughtException', function (error) {
    log(`Time: ${new Date}\n${error}\n`, 'error.log');
    console.log(new Date, error)
});

process.on('unhandledRejection', error => {
    log(`Time: ${new Date}\n${error}\n`, 'error.log');
    console.log(new Date, error)
});

connectDB()
client.login(process.env.TOKEN);
app.listen(port || 5000, () => console.log(`listening on port ${port}...`));

module.exports = client