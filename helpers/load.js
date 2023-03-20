const { REST, Routes } = require('discord.js');
const { readdirSync } = require('fs');
const { join } = require('path');

async function loadCommands(client) {
    const commandsPath = join(__dirname, '../commands')
    const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    const commands = [];

    for (const file of commandFiles) {
        const command = require(`../commands/${file}`);

        if (!command?.data) {
            continue
        }

        commands.push(command.data.toJSON());
        client.commands.set(command.data.name, command);
    }

    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    const rest = new REST({ version: '10' }).setToken(client.token);
    const clientId = client?.application?.id


    if (!clientId) {
        throw new Error('Client Id is invalid.')
    }

    await rest.put(Routes.applicationCommands(clientId), { body: commands });

    console.log(`Successfully reloaded ${commands.length} application (/) commands.`);

    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return;
    
        const command = client.commands.get(interaction.commandName);
    
        if (!command) return;
    
        try {
            await command.execute(interaction);
        } catch (err) {
            console.error(err);
            await interaction.reply({ content: 'There was an error while executing client command!', ephemeral: true });
        }
    });
}

async function loadEvents(client) {

}

module.exports = {
    loadCommands,
    loadEvents
}