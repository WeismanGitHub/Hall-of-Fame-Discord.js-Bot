const { Constants } = require('discord.js');
const GuildSchema = require('../../schemas/guild_schema');
const { errorEmbed, basicEmbed } = require('../../helpers/embeds');

module.exports = {
    category:'Notifications',
    name: 'notification_options',
    description: 'Change the notifications channel and opt in or out of notifications related to the bot.',
    guildOnly: true,
    slash: true,

    options: [
        {
            name: 'on_or_off',
            description: 'Turn notifications on or off.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
            choices: [
                {
                    name: 'on',
                    value: 'true'
                },
                {
                    name: 'off',
                    value: 'false'
                },
            ],
        },
        {
            name: 'notification_channel',
            description: 'Change the default notifications channel.',
            type: Constants.ApplicationCommandOptionTypes.CHANNEL
        }
    ],
    
    callback: async ( { interaction } ) => {
        try {
            const { options } = interaction;
            const preference = options.getString('preference')
            const notificationChannelId = (options.getChannel('notification_channel'))?.id
            let updateObject = {}
            
            if (preference) {
                updateObject.notifications = preference
            }
            
            if (notificationChannelId) {
                updateObject.notificationChannelId = notificationChannelId
            }
            
            if (!Object.keys(updateObject).length) {
                throw new Error('Please update something.')
            }

            await GuildSchema.updateOne({ guildId: interaction.guildId }, updateObject)

            await interaction.reply(basicEmbed('Updated notification preferences!'))
        } catch(err) {
            interaction.reply(errorEmbed(err))
            .catch(_ => interaction.channel.send(errorEmbed(err)))
        }
    }
};