const GuildSchema = require('../../schemas/guild-schema');
const {basicEmbed, errorEmbed} = require('../../functions');
const {Constants} = require('discord.js');
let commandAlreadyRespondedTo = false

module.exports = {
    category:'Authors',
    description: 'Edits an author tied to your server. You attribute an author to a quote.',
    name: 'editauthor',
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

    callback: async ({interaction}) => {
        try {
            const {options} = interaction;
            const guildId = interaction.guildId;
            const oldName = options.getString('name');
            const newName = options.getString('new_name');
            const imgUrl = options.getString('icon_url');

            if ((newName == null) && (imgUrl == null)) {
                await interaction.reply(basicEmbed(`Nothing Updated.`));
                return commandAlreadyRespondedTo = true
            }

            if (imgUrl) {
                const guildDoc = await GuildSchema.findOneAndUpdate(
                    {"$and": [
                        {"guildId": {"$eq": guildId}},
                        {"authors": {"$elemMatch": {"name": {"$eq": oldName}}}}
                    ]},
                    {"$set": {"authors.$.imgUrl": imgUrl}
                })
    
                if (guildDoc == null) {
                    throw new Error(`No author named '${oldName}'.`)
                }
            }

            if (newName) {
                const guildDoc = await GuildSchema.findOneAndUpdate(
                    {"$and": [
                        {"guildId": {"$eq": guildId}},
                        {"authors": {"$elemMatch": {"name": {"$eq": oldName}}}}
                    ]},
                    {"$set": {"authors.$.name": newName}
                })
    
                if (guildDoc == null) {
                    throw new Error(`No author named '${oldName}'.`)
                }
            }

            await interaction.reply(basicEmbed(`Updated '${newName? newName: oldName}'!`));
            commandAlreadyRespondedTo = true

        } catch(err) {
            if (commandAlreadyRespondedTo) {
                await interaction.channel.send(errorEmbed(err))
            } else {
                await interaction.reply(errorEmbed(err));
            }
        };
    }
};