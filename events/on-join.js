const { Events, PermissionFlagsBits } = require('discord.js');
const GuildSchema = require('../schemas/guild-schema');
const { helpEmbed } = require('../helpers/embeds')

module.exports = {
	name: Events.GuildCreate,
	once: false,
    execute: async (guild) => {
        try {
            const guildId = guild.id;
            const isGuildRegistered = await GuildSchema.exists({ _id: guildId })
        
            if (!isGuildRegistered) {
                await GuildSchema.create({_id: guildId });
            }
            
            const channel = guild.systemChannel || guild.channels.cache.find(channel => {
                return channel.type == 0 && channel.permissionsFor(guild?.members?.me)?.has(PermissionFlagsBits.SendMessages)
            })

            if (!channel) return
            
            await channel.send(helpEmbed())
        } catch(err) {
            console.log(err)
        }
    }
};