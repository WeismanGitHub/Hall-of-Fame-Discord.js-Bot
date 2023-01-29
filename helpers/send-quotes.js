const { quoteEmbed, errorEmbed } = require('./embeds');
const GuildSchema = require('../schemas/guild-schema')
const client = require('../index')

async function sendQuotes(quotes, channel) {
    let authors = (await GuildSchema.findById(quotes[0].guildId).select('-_id authors').lean()).authors
    authors = await Promise.all(authors.map(async author => {
        if (author.discordId) {
            author.iconURL = (await client.users.fetch(author.discordId))?.avatarURL()
            delete author.discordId
        }

        return author
    }))

    const quoteGroups = [];

    while (quotes.length > 0) {
        quoteGroups.push(quotes.splice(0, 10))
    }

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

            quoteEmbeds.push(...(await quoteEmbed(quote, author ?? checkedFragments)).embeds)
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

