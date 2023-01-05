const errorHandler = require('../../helpers/error-handler');
const GuildSchema = require('../../schemas/guild-schema');
const { basicEmbed } = require('../../helpers/embeds');
const { NotFoundError } = require('../../errors');
require('dotenv').config();

module.exports = {
    category:'Tags',
    name: 'get_tags',
    description: 'Gets all tags. Tags can be used to classify quotes.',
    guildOnly: true,
    slash: true,

    callback: async ({ interaction }) => errorHandler(interaction, async () => {
        const guildId = interaction.guildId;
        let message = '';
    
        const tags= (await GuildSchema.find({ _id: guildId }).select('tags').lean())[0].tags
        .sort((firstTag, secondTag) => firstTag.localeCompare(secondTag, undefined, { sensitivity: 'base' }))

        tags.forEach(tag => {
            message += `${tag}\n`;
        });
        
        if (!tags.length) {
            throw new NotFoundError('Tags')
        }

        await interaction.reply(basicEmbed('Server Tags:', message))
    })
};