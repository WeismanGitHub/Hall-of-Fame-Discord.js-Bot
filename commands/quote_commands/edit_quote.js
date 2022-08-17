const GuildSchema = require('../../schemas/guild_schema');
const QuoteSchema= require('../../schemas/quote_schema');
const { Constants } = require('discord.js');

const {
    basicEmbed,
    errorEmbed,
    quoteEmbed,
    getAuthorByName,
    getAuthorById,
    checkTags
} = require('../../functions');

module.exports = {
    category:'Quotes',
    description: 'Edit a quote tied to your server.',
    name: 'editquote',
    slash: true,

    options: [
        {
            name: 'id',
            description: 'The id of the quote.',
            required: true,
            type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'new_author',
            description: 'Name of the new author. You must create an author beforehand.',
            type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'new_text',
            description: 'New quote text.',
            type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'new_attachment',
            description: 'New image attachment. Must be a link.',
            type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'delete_tags',
            description: 'Removes tags from quote.',
            type: Constants.ApplicationCommandOptionTypes.BOOLEAN
        },
        {
            name: 'delete_attachment',
            description: 'Removes image attachment from quote.',
            type: Constants.ApplicationCommandOptionTypes.BOOLEAN
        },
        {
            name: 'first_tag',
            description: 'Tags are used for filtering. You must create a tag beforehand. New tags will overwrite the old ones.',
            type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'second_tag',
            description: 'Tags are used for filtering. You must create a tag beforehand. New tags will overwrite the old ones.',
            type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'third_tag',
            description: 'Tags are used for filtering. You must create a tag beforehand. New tags will overwrite the old ones.',
            type: Constants.ApplicationCommandOptionTypes.STRING
        }
    ],

    callback: async ({ interaction }) => {
        try {
            const { options } = interaction;
            const guildId  = interaction.guildId;
            const _id = options.getString('id');

            const quote = await QuoteSchema.findOne({
                _id: _id,
                guildId: guildId,
                isAudioQuote: false
            }).select('_id').lean()

            if (!quote) {
                throw new Error('Quote does not exist.')
            }
    
            let updateObject = {};
    
            const newAttatchment = options.getString('new_attachment');
            const deleteTags = options.getBoolean('delete_tags');
            const deleteAttachment = options.getBoolean('delete_attachment');
            const newAuthorName = options.getString('new_author');
            const newText = options.getString('new_text');

            const uncheckedTags = [
                options.getString('first_tag'),
                options.getString('second_tag'),
                options.getString('third_tag'),
            ];
            
            const thereAreNewTags = uncheckedTags.some(tag => tag !== null);
            
            if (thereAreNewTags) {
                const guildTags = (await GuildSchema.findOne({ guildId: guildId }).select('-_id tags').lean()).tags;
                let checkedTagsObject = await checkTags(uncheckedTags, guildTags)

                if (checkedTagsObject.tagsExist) {
                    updateObject['tags'] = checkedTagsObject.checkedTags
                } else {
                    throw new Error('Make sure all your tags exist.')
                }
            }
    
            if (newAttatchment) {
                updateObject.attachment = newAttatchment;
            };


            if (deleteTags) {
                updateObject['tags'] = [];
            }
    
            if (newText) {
                updateObject['text'] = newText;
            }
            
            if (newAuthorName) {
                const author = await getAuthorByName(newAuthorName, guildId);

                if (author.name == 'Deleted Author') {
                    throw new Error('Author does not exist.')
                }
    
                updateObject['authorId'] = author._id;
            }
            
            if (Object.keys(updateObject).length || deleteAttachment) {
                const updatedQuote = await QuoteSchema.findOneAndUpdate(
                    { _id: _id, guildId: guildId },
                    updateObject,
                    { new: true }
                ).lean()

                if (deleteAttachment) {
                    await QuoteSchema.updateOne({ _id: _id, guildId: guildId }, { $unset: {'attachment': '' } });
                }

                const author = await getAuthorById(updatedQuote.authorId, guildId);
    
                await interaction.reply(quoteEmbed(updatedQuote, author));
    
            } else {
                await interaction.reply(basicEmbed('Nothing Updated.'));
            }
            
        } catch(err) {
            await interaction.reply(errorEmbed(err));
        };

    }
};