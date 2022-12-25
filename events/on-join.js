const GuildSchema = require('../schemas/guild-schema');

module.exports = (client) => {
    client.on('guildCreate', async (guild) => {
        const guildId = guild.id;
        const guildRegistered = await GuildSchema.exists({ _id: guildId })
    
        if (!guildRegistered) {
            await GuildSchema.create({_id: guildId });
        }
    });
}

module.exports.config = {
    dbName: "on-join",
    displayName: "on-join",
}