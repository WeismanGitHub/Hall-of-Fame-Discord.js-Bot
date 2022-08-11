const Discord = require('discord.js');

module.exports = {
    description: 'help command',
    name: 'help',
    slash: true, 
    category:'Help',

    callback: async ( {instance, interaction} ) => {
        try {
            const blackListedCommands = ['language', 'prefix', 'requiredrole', 'slash', 'command', 'channelonly'];
            const commandsEmbed = new Discord.MessageEmbed()
            .setColor('#5865F2')
            .setTitle('Commands:');
  
            for await (let command of instance.commandHandler.commands) {
                if (!blackListedCommands.includes(command.names[0])) {
                    commandsEmbed.addFields({name: `${command.names[0]}`, value: `${command.description}`});
                  }
              }

            const descriptionEmbed = new Discord.MessageEmbed()
            .setColor('#5865F2')
            .setTitle('Instructions:')
            .setDescription("To create quotes you must first create authors and tags.\nAuthors must have a name and an image url.\nTags are just characters.\nQuotes must have an Author, and can have text and or an attachment url.\nQuotes can have up to 3 tags. You can edit and delete quotes (/editquote, /deletequote).\n\nAudio quotes work exactly the same as regular quotes, but instead of text and or an image, you upload a link to an audio file.\nYou can upload the audio file to discord and copy the link to that.\nThis feature was inspired by the bot AIRHORNSOLUTIONS.\nUsing /playaudioquote will make the bot join the voice channel you're in, play the audio quote, and leave.");
        
            await interaction.reply({embeds: [descriptionEmbed, commandsEmbed]});
        } catch(err) {
            await interaction.reply(errorEmbed(err));   
        };
    }
};