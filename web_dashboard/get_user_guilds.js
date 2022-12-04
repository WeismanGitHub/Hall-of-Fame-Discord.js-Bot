const { PermissionsBitField } = require('discord.js');
const DiscordOauth2 = require("discord-oauth2");

const oauth = new DiscordOauth2();

async function getUserGuilds(accessToken) {
    const guilds = (await oauth.getUserGuilds('req.accessToken')).filter(guild => {
        const permissions = new PermissionsBitField(guild.permissions)
        
        return permissions.has(PermissionsBitField.Flags.USE_APPLICATION_COMMANDS)
    }).map(guild => {
        return { id: guild.id, icon: guild.icon }
    })

    return guilds
}

module.exports = getUserGuilds