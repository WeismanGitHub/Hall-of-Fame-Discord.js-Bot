const { MessageActionRow, MessageButton } = require('discord.js');
const GuildSchema = require('../schemas/guild-schema');
const { basicEmbed } = require('../helpers/embeds');
const { InvalidInputError } = require('../errors')

module.exports = {
    category:'Quotes',
    name: 'quotes_channel',
    description: 'Choose a channel to have all the quotes in. It will be updated when new quotes are created.',
    guildOnly: true,
    slash: true,

    options: [
        {
            name: 'channel',
            description: 'Choose a channel to have all the quotes in. It will be updated with new quotes.',
            // type: Constants.ApplicationCommandOptionTypes.CHANNEL,
        },
        {
            name: 'remove',
            description: 'Remove the quotes channel.',
            // type: Constants.ApplicationCommandOptionTypes.STRING,
            choices: [
                {
                    name: 'remove',
                    value: 'true'
                },
                {
                    name: 'keep',
                    value: 'false'
                },
            ]
        }
    ],

    callback: async (interaction ) => {
        const { options } = interaction;
        const guildId = interaction.guildId;
        const quotesChannel = options.getChannel('channel');
        const removeChannel = options.getString('remove');
        const channelId = quotesChannel?.id

        if (removeChannel == null && !quotesChannel) {
            throw new InvalidInputError('No Changes')
        }

        if (removeChannel) {
            await GuildSchema.updateOne({ _id: guildId }, { $unset: { quotesChannelId: true } })
            return await interaction.reply(basicEmbed('Removed quotes channel!'))
        }
        
        if (quotesChannel.type !== 'GUILD_TEXT') {
            throw new InvalidInputError('Channel')
        }

        await GuildSchema.updateOne({ _id: guildId }, { quotesChannelId: channelId })
        const customId = JSON.stringify({ type: 'quotes-channel', channelId: channelId })

        const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setLabel(`Forward All Quotes`)
            .setCustomId(`${customId}`)
            .setStyle('PRIMARY')
        )

        await interaction.reply({
            ...basicEmbed(`New quotes will be forwarded to \`#${quotesChannel.name}\` from now on.`),
                components: [row]
        })
    }
};