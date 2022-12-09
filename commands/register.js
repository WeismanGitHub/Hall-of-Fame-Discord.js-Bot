const errorHandler = require('../helpers/error-handler');
const GuildSchema = require('../schemas/guild-schema');
const { basicEmbed } = require('../helpers/embeds');

module.exports = {
    category:'Register',
    name: 'register',
    description: 'Register your server.',
    guildOnly: true,
    slash: true,

    callback: async ({ interaction }) => errorHandler(interaction, async () => {
        const guildId = interaction.guildId;

        if (!await GuildSchema.findOne({ _id: guildId }).select('_id').lean()) {
            await GuildSchema.create({ _id: guildId })

            await interaction.reply(basicEmbed('Registered This Server!'));
        } else {
            await interaction.reply(basicEmbed('Already Registered!'));
        }
    })
};