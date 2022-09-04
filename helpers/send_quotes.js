const { errorEmbed, quoteEmbed } = require('../helpers/embeds');
const { getAuthorById } = require('../helpers/get_author');

async function sendQuotes(quotes, channel) {
    const quoteEmbeds = []

    for (let quote of quotes) {
        const quoteAuthor = await getAuthorById(quote.authorId, channel.guild.id);
        // Gotta destructure the quote embed because it returns { embeds: [embed] }.
        quoteEmbeds.push(...quoteEmbed(quote, quoteAuthor).embeds)
    }

                
    await channel.send({ embeds: quoteEmbeds })
    .catch(async err => {
        console.log(err)
        // await channel.send(errorEmbed(err, `Quote Id: ${quote._id}`));
    });
}

module.exports = sendQuotes

