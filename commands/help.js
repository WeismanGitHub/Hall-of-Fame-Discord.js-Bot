const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const errorHandler = require('../helpers/error-handler');
require('dotenv').config();

module.exports = {
    description: "Find out more about this bot and it's commands.",
    name: 'help',
    slash: true, 
    category:'Help',

    callback: async ({ interaction }) => errorHandler(interaction, async () => {
        const customId = JSON.stringify({ type: 'help' })

        const row = new MessageActionRow()
        .addComponents([
            new MessageButton()
            .setLabel('Command Descriptions')
            .setCustomId(`${customId}`)
            .setStyle('PRIMARY'),
            new MessageButton()
            .setLabel('Source Code')
            .setURL("https://github.com/WeismanGitHub/Hall-of-Fame-Discord.js-Bot")
            .setStyle('LINK'),
            new MessageButton()
            .setLabel('In-Depth Explanation')
            .setURL("https://github.com/WeismanGitHub/Hall-of-Fame-Discord.js-Bot/blob/master/README.md")
            .setStyle('LINK')
        ])

        const descriptionEmbed = new MessageEmbed()
        .setColor('#5865F2')
        .setDescription('A hall of fame bot with 28 commands that allow you save text, images, and audio. The purpose is to allow users to organize memorable moments so they can be easily accessed and found with authors, tags, types, dates, and more. To create quotes you must first create an author for the quote. An author has a name and optionally an image. You can also add tags to quotes, which need to be created beforehand. Every type of quote (audio, image, regular, and multi) has an author, text, and up to three tags. I strongly recommend you check the Github readme for a more in depth explanation.')
        .addFields({ name: 'Contact the Creator:', value: `<@${process.env.MAIN_ACCOUNT_ID}>` })
    
        await interaction.reply({ embeds: [descriptionEmbed], components: [row] });
    })
};
