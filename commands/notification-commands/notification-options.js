const errorHandler = require('../../helpers/error-handler');
const GuildSchema = require('../../schemas/guild-schema');
const { basicEmbed } = require('../../helpers/embeds');
const { InvalidInputError } = require('../../errors');

module.exports = {
    category:'Notifications',
    name: 'notification_options',
    description: 'Change the notifications channel and opt in or out of notifications.',
    guildOnly: true,
    slash: true,

    options: [
        {
            name: 'notifications',
            description: 'Turn notifications on or off.',
    //        type: Constants.ApplicationCommandOptionTypes.STRING,
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
    //        type: Constants.ApplicationCommandOptionTypes.CHANNEL
        }
    ],
    
    callback: async ({ interaction }) => errorHandler(interaction, async () => {
        const { options } = interaction;
        const notifications = options.getString('notifications')
        const notificationChannelId = (options.getChannel('notification_channel'))?.id
        let update = {}
        
        if (notifications) {
            update.notifications = notifications
        }
        
        if (notificationChannelId) {
            update.notificationChannelId = notificationChannelId
        }
        
        if (!Object.keys(update).length) {
            throw new InvalidInputError('No Changes')
        }

        await GuildSchema.updateOne({ _id: interaction.guildId }, update)

        await interaction.reply(basicEmbed('Updated notification preferences!'))
    })
};