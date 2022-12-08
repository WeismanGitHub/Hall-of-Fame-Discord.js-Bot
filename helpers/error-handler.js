const { errorEmbed } = require('./embeds');

function errorHandler(interaction, commandFunc) {
    commandFunc().catch(err => {
        interaction.reply(errorEmbed(err))
        .catch(_ => interaction.channel.send(errorEmbed(err)))
    })
}

module.exports = errorHandler