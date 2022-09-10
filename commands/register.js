const { basicEmbed, errorEmbed } = require('../helpers/embeds');
const GuildSchema = require('../schemas/guild_schema');

module.exports = {
    category:'Register',
    name: 'register',
    description: 'Register your server.',
    guildOnly: true,
    slash: true,

    callback: async ({interaction}) => {
        try {
            const guildId = interaction.guildId;
    
            if (!await GuildSchema.findOne({ guildId: guildId }).select('_id').lean()) {
                await GuildSchema.create({ guildId: guildId })
    
                await interaction.reply(basicEmbed('Registered This Server!'));
            } else {
                await interaction.reply(basicEmbed('Already Registered!'));
            }
        } catch(err) {
            interaction.reply(errorEmbed(err))
            .catch(_ => interaction.channel.send(errorEmbed(err)))
        }
    }
};