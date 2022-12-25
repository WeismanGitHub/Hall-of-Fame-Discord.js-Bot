const errorHandler = require('../helpers/error-handler');
const { helpEmbed } = require('../helpers/embeds')

module.exports = {
    description: "Find out more about this bot and it's commands.",
    name: 'help',
    slash: true, 
    category:'Help',

    callback: async ({ interaction }) => errorHandler(interaction, async () => {
        interaction.reply(helpEmbed())
    })
};
