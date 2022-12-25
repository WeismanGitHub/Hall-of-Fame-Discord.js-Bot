const GuildSchema = require('../schemas/guild-schema');
const { helpEmbed } = require('../helpers/embeds')

module.exports = (client) => {
    client.on('guildCreate', async (guild) => {
        const guildId = guild.id;
        const guildRegistered = await GuildSchema.exists({ _id: guildId })
    
        if (!guildRegistered) {
            await GuildSchema.create({_id: guildId });
        }

        const channel = guild.systemChannelID ?? guild.channels.cache.find(channel => 
            channel.type == 'GUILD_TEXT' && channel.permissionsFor(guild.me).has('SEND_MESSAGES')
        )
        
        await channel.send(helpEmbed())
    })
}

module.exports.config = {
    dbName: "on-join",
    displayName: "on-join",
}