const GuildSchema = require('../../schemas/guild-schema');
const {basicEmbed, errorEmbed} = require('../../functions');
require('dotenv').config();

module.exports = {
    description: 'Gets all tags tied to your server.',
    category:'Tags',
    name: 'getalltags',
    slash: true,

    callback: async ({interaction}) => {
        try {
            const guildId = interaction.guildId;
        
            const tagsList= await GuildSchema.find({guildId: guildId}).select('tags');
            
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
            await interaction.reply(errorEmbed(err));   
        };
    }
};