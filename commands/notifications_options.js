const { Constants, MessageEmbed } = require('discord.js');
const GuildSchema = require('../schemas/guild_schema');
const { errorEmbed } = require('../helpers/embeds');

module.exports = {
    description: 'Opt in or out of notifications related to the bot. (On by default)',
    name: 'notifications',
    slash: true, 
    category:'Notifications',

    options: [
        {
            name: 'preference',
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

            const embed = { embeds: [new MessageEmbed()
                .setColor('#3826ff')
                .setTitle('Updated notification preferences!')
            ]}

            await interaction.reply(embed)
        } catch(err) {
            interaction.reply(errorEmbed(err))
            .catch(_ => interaction.channel.send(errorEmbed(err)))
        }
    }
};