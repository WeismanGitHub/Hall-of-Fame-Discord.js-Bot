const { errorEmbed, basicEmbed } = require('../../helpers/embeds');
const GuildSchema = require('../../schemas/guild_schema');
require('dotenv').config();

module.exports = {
    description: 'Gets all tags tied to your server.',
    category:'Tags',
    name: 'get_tags',
    slash: true,

    callback: async ({ interaction }) => {
        try {
            const guildId = interaction.guildId;
        
            const tagsList= await GuildSchema.find({ guildId: guildId }).select('tags').lean();
            
            if (!tagsList) {
                await interaction.reply('Please register server.');
            }
        
            const tags = tagsList[0].tags;
            let message = '';
        
            tags.forEach(tag => {
                message += `${tag}\n\n`;
            });
            
            await interaction.reply(tags.length? basicEmbed('Server Tags:', message) : basicEmbed('There are no tags.'));
        } catch(err) {
            interaction.reply(errorEmbed(err))
            .catch(_ => interaction.channel.send(errorEmbed(err)))
        }
    }
};