const GuildSchema = require('../schemas/guild_schema');

module.exports = (client) => {
    client.on('guildCreate', async (guild) => {
        const guildId = guild.id;
        const guildRegistered = await GuildSchema.exists({guildId: guildId})
    
        if (!guildRegistered) {
            await GuildSchema.create({guildId: guildId});
        }
    });
}

module.exports.config = {
    dbName: "onJoin",
    displayName: "on_join",
}