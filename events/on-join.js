const errorHandler = require('../helpers/error-handler');
const GuildSchema = require('../schemas/guild-schema');
const { helpEmbed } = require('../helpers/embeds')
const { Events } = require('discord.js');

module.exports = {
	name: Events.GuildCreate,
	once: false,
    execute: async (interaction) => errorHandler(interaction, async () => {
        console.log(interaction)
        // const guildId = guild.id;
        // const guildRegistered = await GuildSchema.exists({ _id: guildId })
    
        // if (!guildRegistered) {
        //     await GuildSchema.create({_id: guildId });
        // }

        // const channel = guild.systemChannelID ?? guild.channels.cache.find(channel => 
        //     channel.type == 'GUILD_TEXT' && channel.permissionsFor(guild.me).has('SEND_MESSAGES')
        // )
        
        // await channel.send(helpEmbed())
    })
};