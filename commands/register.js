const GuildSchema = require('../schemas/guild-schema');
const { basicEmbed, errorEmbed } = require('../functions');

module.exports = {
    category:'Register',
    description: 'Register your server.',
    name: 'register',
    slash: true,

    callback: async ({interaction}) => {
        try {
            const guildId = interaction.guildId;
    
            if (!await GuildSchema.findOne({ guildId: guildId })) {
                await GuildSchema.create({ guildId: guildId })
    
                await interaction.reply(basicEmbed('Registered This Server!'));
            } else {
                await interaction.reply(basicEmbed('Already Registered!'));
            }
        } catch(err) {
            await interaction.reply(errorEmbed(err));
        };
    }
};