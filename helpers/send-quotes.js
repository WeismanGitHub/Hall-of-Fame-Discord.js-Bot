const { ActionRowBuilder, ButtonBuilder} = require('discord.js')
const { quoteEmbed, errorEmbed } = require('./embeds')
const GuildSchema = require('../schemas/guild-schema')

async function sendQuotes(quotes, interaction, customId, skipAmount) {
    const authors = (await GuildSchema.findById(interaction.guild.id).select('-_id authors').lean()).authors
    const quoteEmbeds = []

    for (let quote of quotes) {
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

    const row = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
        .setCustomId(JSON.stringify({...customId, ...{ skipAmount: Number(skipAmount) - 10 } }))
        .setDisabled(Number(skipAmount) <= 0)
        .setLabel('⏪')
        .setStyle('Primary')
    )
    .addComponents(
        new ButtonBuilder()
        .setCustomId(JSON.stringify({...customId, ...{ skipAmount: Number(skipAmount) + 10 } }))
        .setLabel('⏩')
        .setDisabled(quotes.length !== 10)
        .setStyle('Primary')
    )

    await interaction.reply({ embeds: quoteEmbeds, components: [row] })
    .catch(async err => {
        // figure out proper error handling solution. display fucked up quote somehow

        // for (let quote of quoteEmbeds) {
        //     await channel.send({ embeds: [quote] })
        //     .catch(async err => {
        //         channel.send(errorEmbed(err, `Quote Id: ${quote.fields[0]['value']}`));
        //     });
        // }
    })
}

module.exports = sendQuotes

