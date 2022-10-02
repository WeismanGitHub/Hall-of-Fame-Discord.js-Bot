const GuildSchema = require('../schemas/guild_schema');

async function updateQuotesChannel(quote, guildId, client) {
    const quotesChannelId = (await GuildSchema.findOne({ guildId: guildId })
    .select('quotesChannelId').lean())?.quotesChannelId

    if (quotesChannelId) {
        const quotesChannel = await client.channels.fetch(quotesChannelId)
        .catch(err => { throw new Error('Problem sending quotes to quotes channel.') })

        await quotesChannel.send(quote)
    }
}

module.exports = updateQuotesChannel