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
            .setTitle('Description:')
            .setDescription("To create quotes you must first create authors and tags.\nAuthors must have a name and an image url.\nTags just be words.\nQuotes must have an Author and at least text or an attachment url. You can have both.\nQuotes can have up to 3 tags, and editing the tags later on rewrites them.");
        
            await interaction.reply({embeds: [descriptionEmbed, commandsEmbed]});
        } catch(err) {
            await interaction.reply(errorEmbed(err));   
        };
    }
};