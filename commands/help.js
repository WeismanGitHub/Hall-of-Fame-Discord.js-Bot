const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const errorHandler = require('../helpers/error-handler');
require('dotenv').config();

module.exports = {
    description: "Find out more about this bot and it's commands.",
    name: 'help',
    slash: true, 
    category:'Help',

    callback: async ({ interaction }) => errorHandler(interaction, async () => {
        const row = new MessageActionRow()
        .addComponents([
            new MessageButton()
            .setLabel('Command Descriptions')
            .setCustomId(',,command_descriptions')
            .setStyle('PRIMARY'),
            new MessageButton()
            .setLabel('Source Code')
            .setURL("https://github.com/WeismanGitHub/Hall-of-Fame-Discord.js-Bot")
            .setStyle('LINK')
        ])

        const descriptionEmbed = new MessageEmbed()
        .setColor('#5865F2')
        .setDescription('A hall of fame bot with 26 commands that allow you save text, images, and audio. To create quotes you must first create authors, which have an image and name. Regular quotes have an author and text or an image. Audio quotes have an author, audio/video file, and a title. Play audio quotes in a voice channel with /play_quote! You can upload a file to Discord and copy the link or use the last_attachment parameter to get the most recent file sent in a channel.')
        .addFields({ name: 'Contact the Creator:', value: `<@${process.env.MAIN_ACCOUNT_ID}>` })
    
        await interaction.reply({ embeds: [descriptionEmbed], components: [row] });
    })
};