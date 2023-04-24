const { quoteEmbed, errorEmbed } = require('../../helpers/embeds');
const QuoteSchema = require('../../schemas/quote-schema')
const GuildSchema = require('../../schemas/guild-schema')
const { basicEmbed } = require('../../helpers/embeds')
const { Events } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	once: false,
	execute: async (interaction) => {
        if (!interaction.isButton()) {
            return
        }

        const { channelId, type } = JSON.parse(interaction.customId)
        
        if (type !== 'quotes-channel') {
            return
        }

        const channel = await interaction.client.channels.fetch(channelId)
        const quotes = await QuoteSchema.find({ guildId: channel.guildId }).sort({ createdAt: 1 }).lean()

        const authors = (await GuildSchema.findById(channel.guild.id).select('-_id authors').lean()).authors
        const quoteGroups = [];

        while (quotes.length > 0) {
            quoteGroups.push(quotes.splice(0, 10))
        }

        await interaction.reply(basicEmbed('Designated Quotes Channel'))
        
        for (let quoteGroup of quoteGroups) {
            const quoteEmbeds = []

            for (let quote of quoteGroup) {
                const checkedFragments = [];
                let author = null;

                if (quote.type == 'multi') {
                    for (let fragment of quote.fragments) {
                        const authorName = (authors.find(({ _id }) => _id?.equals(fragment.authorId) ))?.name
                        fragment.authorName = authorName ?? 'Deleted Author'

                        checkedFragments.push(fragment)
                    }
                } else {
                    author = (authors.find(({ _id }) => _id?.equals(quote.authorId) )) || {
                        name: 'Deleted Author',
                        iconURL: process.env.DEFAULT_ICON_URL
                    }
                }

                quoteEmbeds.push(...quoteEmbed(quote, author ?? checkedFragments).embeds)
            }

            channel.send({ embeds: quoteEmbeds })
            .catch(async _ => {
                for (let quote of quoteEmbeds) {
                    await channel.send({ embeds: [quote] })
                    .catch(async err => {
                        channel.send(errorEmbed(err, `Quote Id: ${quote.fields[0]['value']}`));
                    });
                }
            })
        }
	}
}