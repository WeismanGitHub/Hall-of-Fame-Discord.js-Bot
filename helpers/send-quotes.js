const { getAuthorById } = require('../helpers/get-author');
const { quoteEmbed, errorEmbed } = require('./embeds');
const GuildSchema = require('../schemas/guild-schema')

async function sendQuotes(quotes, channel) {
    const quoteGroups = [];

    while (quotes.length > 0) {
        quoteGroups.push(quotes.splice(0, 10))
    }

    for (let quoteGroup of quoteGroups) {
        const quoteEmbeds = []

        for (let quote of quoteGroup) {
            let author = null;
            const checkedFragments = [];

            if (quote.type == 'multi') {
                const guildAuthors = (await GuildSchema.findById(quote.guildId).select('-_id authors').lean()).authors

                for (let fragment of quote.fragments) {
                    const authorName = (guildAuthors.find(({ _id }) => _id?.equals(fragment.authorId) ))?.name
                    fragment.authorName = authorName ?? 'Deleted Author'

                    checkedFragments.push(fragment)
                }
            } else {
                author = await getAuthorById(quote.authorId, channel.guild.id);
            }

            quoteEmbeds.push(...quoteEmbed(quote, author ?? checkedFragments).embeds)
        }

        await channel.send({ embeds: quoteEmbeds })
        .catch(async _ => {
            for (let quote of quoteEmbeds) {
                await channel.send({ embeds: [quote] })
                .catch(async err => {
                    channel.send(errorEmbed(err, `Quote Id: ${quote.fields[0]['value']}`));
                });
            }
        })
    };
}

module.exports = sendQuotes

