const GuildSchema = require('../schemas/guild-schema');

async function updateQuotesChannel(quote, guildId, client) {
    const quotesChannelId = (await GuildSchema.findOne({ _id: guildId })
    .select('quotesChannelId').lean())?.quotesChannelId

    if (quotesChannelId) {
        const quotesChannel = await client.channels.fetch(quotesChannelId)
        .catch(err => { throw new Error("Can't send quotes to quotes channel.") })

        await quotesChannel.send(quote)
    }
}

module.exports = updateQuotesChannel