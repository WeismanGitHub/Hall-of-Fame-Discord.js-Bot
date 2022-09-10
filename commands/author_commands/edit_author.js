const { errorEmbed, basicEmbed } = require('../../helpers/embeds');
const GuildSchema = require('../../schemas/guild_schema');
const checkURL = require('../../helpers/check_url')
const { Constants } = require('discord.js');

module.exports = {
    category:'Authors',
    name: 'edit_author',
    description: 'Edits an author tied to your server.',
    guildOnly: true,
    slash: true,

    options: [
        {
            name: 'name',
            description: 'The name of the author you want to edit. (case sensitive)',
            required: true,
            type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'new_name',
            description: 'The name you want to change the author to. (case sensitive)',
            type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'icon_url',
            description: 'This will be the image displayed with the author.',
            type: Constants.ApplicationCommandOptionTypes.STRING
        }
    ],

    callback: async ({ interaction }) => {
        try {
            const { options } = interaction;
            const guildId = interaction.guildId;
            const oldName = options.getString('name');
            const newName = options.getString('new_name');
            const newImgUrl = options.getString('icon_url');

            if ((newName == null) && (newImgUrl == null)) {
                return await interaction.reply(basicEmbed(`Nothing Updated.`));
            }

            if (newImgUrl) {
                if (!checkURL(newImgUrl)) {
                    throw new Error('Please input a valid url.')
                }

                const guildDoc = await GuildSchema.findOneAndUpdate(
                    { "$and": [
                        { "guildId": { "$eq": guildId } },
                        { "authors": { "$elemMatch": { "name": { "$eq": oldName } } } }
                    ]},
                    { "$set": { "authors.$.imgUrl": newImgUrl }
                }).select('_id').lean()
    
                if (guildDoc == null) {
                    throw new Error(`No author named '${oldName}'.`)
                }
            }

            if (newName) {
                const guildDoc = await GuildSchema.findOneAndUpdate(
                    { "$and": [
                        { "guildId": { "$eq": guildId } },
                        { "authors": { "$elemMatch": { "name": { "$eq": oldName } } } }
                    ]},
                    { "$set": { "authors.$.name": newName }
                }).select('_id').lean()
    
                if (guildDoc == null) {
                    throw new Error(`No author named '${oldName}'.`)
                }
            }

            await interaction.reply(basicEmbed(`Updated '${newName? newName: oldName}'!`));
        } catch(err) {
            interaction.reply(errorEmbed(err))
            .catch(_ => interaction.channel.send(errorEmbed(err)))
        }
    }
};