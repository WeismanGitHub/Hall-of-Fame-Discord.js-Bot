const { REST, Routes } = require('discord.js');
const { statSync, readdirSync } = require('fs');
const { join } = require('path');

function getPaths(dir) {
    const paths = readdirSync(dir)
    const filePaths = []

    function recursiveLoop(paths) {
        for (let path of paths) {
            const fileStat = statSync(path)
            
            if (fileStat.isFile()) {
                filePaths.push(path)
            } else if (fileStat.isDirectory()) {
                recursiveLoop(readdirSync(path).map(subPath => join(path, subPath)))
            }
        }
    }
    
    recursiveLoop(paths.map(path => join(dir, path)))
    return filePaths
}

async function loadCommands(client) {
    const commandPaths = getPaths(join(__dirname, '../commands')).filter(file => file.endsWith('.js'))
    const commands = [];

    for (const path of commandPaths) {
        const command = require(path);

        if (!command?.data) {
            continue
        }

        commands.push(command.data.toJSON());
        client.commands.set(command.data.name, command);
    }

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
    const eventsPaths = getPaths(join(__dirname, '../events')).filter(file => file.endsWith('.js'))
    
    for (const eventPath of eventsPaths) {
        const event = require(eventPath);

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }

    console.log(`Successfully loaded ${eventsPaths.length} events.`);
}

module.exports = {
    loadCommands,
    loadEvents
}