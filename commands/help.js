const Discord = require('discord.js');
require('dotenv').config();

module.exports = {
    description: "Find out more about this bot and it's commands.",
    name: 'help',
    slash: true, 
    category:'Help',

    callback: async ( { instance, interaction } ) => {
        try {
            const blackListedCommands = ['language', 'prefix', 'requiredrole', 'slash', 'command', 'channelonly'];
            const commandsEmbed = new Discord.MessageEmbed()
            .setColor('#5865F2')
            .setTitle('Commands:');
  
            for await (let command of instance.commandHandler.commands) {
                if (!blackListedCommands.includes(command.names[0])) {
                    commandsEmbed.addFields({ name: `${command.names[0]}`, value: `${command.description}` });
                }
            }
            
            const descriptionEmbed = new Discord.MessageEmbed()
            .setColor('#5865F2')
            .setTitle('Instructions:')
            .setDescription("To create quotes you must first create authors and tags.\nAuthors must have a name and optionally an image.\nQuotes require an author and text or an attachment url. Or both.\nQuotes can have up to 3 tags. You can edit and delete quotes with /editquote and /deletequote.\n\nAudio quotes work exactly the same as regular quotes, but instead of text/image, you upload a link to an audio/video file.\nDeleting and getting audio quotes is the same, but to edit them use /editaudioquote.\nYou can upload the audio/video file to discord and copy the link to that.\nThis feature was inspired by the bot AIRHORNSOLUTIONS.\nUsing /playaudioquote will make the bot join the voice channel you're in, play the audio quote and leave.\nTo get file links you can upload the file to Discord and copy the link to that. You can also use the last_attachment parameter to just use the most recent file sent in the channel.")
            .addFields({ name: 'Contact the Creator:', value: `<@${process.env.MAIN_ACCOUNT_ID}>` })
        
            await interaction.reply({ embeds: [descriptionEmbed, commandsEmbed] });
        } catch(err) {
            interaction.reply(errorEmbed(err))
            .catch(_ => interaction.channel.send(errorEmbed(err)))
        }
    }
};