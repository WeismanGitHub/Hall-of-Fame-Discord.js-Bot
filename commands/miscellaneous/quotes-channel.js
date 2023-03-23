const { ActionRowBuilder, ButtonBuilder, SlashCommandBuilder, ChannelType } = require('discord.js');
const { channelDescription, removeDescription } = require('../../descriptions');
const GuildSchema = require('../../schemas/guild-schema');
const { basicEmbed } = require('../../helpers/embeds');
const { InvalidInputError } = require('../../errors')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('quotes_channel')
		.setDescription('Choose a channel to have all the quotes in. It will be updated when new quotes are created.')
        .setDMPermission(false)
        .addChannelOption(option => option
            .setName('channel')
            .setDescription(channelDescription)
            .addChannelTypes(ChannelType.GuildText)
        )
        .addStringOption(option => option
            .setName('remove')
            .setDescription(removeDescription)
            .addChoices(
				{ name: 'remove', value: 'true' },
				{ name: 'keep', value: 'false' },
			)
        )
	,
	execute: async (interaction) => {
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

        await GuildSchema.updateOne({ _id: guildId }, { quotesChannelId: channelId })
        const customId = JSON.stringify({ type: 'quotes-channel', channelId: channelId })

        const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setLabel(`Forward All Quotes`)
            .setCustomId(`${customId}`)
            .setStyle('Primary')
        )

        await interaction.reply({
            ...basicEmbed(`New quotes will be forwarded to \`#${quotesChannel.name}\` from now on.`),
                components: [row]
        })
    }
};