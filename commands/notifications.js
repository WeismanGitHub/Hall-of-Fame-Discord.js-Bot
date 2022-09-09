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
            ]
        },
    ],
    
    callback: async ( { interaction } ) => {
        try {
            const { options } = interaction;
            const preference = (options.getString('preference'))

            await GuildSchema.updateOne({ guildId: interaction.guildId }, { notifications: preference })

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