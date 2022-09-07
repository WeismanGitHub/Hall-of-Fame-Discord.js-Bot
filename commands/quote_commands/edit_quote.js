const { errorEmbed, quoteEmbed, basicEmbed } = require('../../helpers/embeds');
const { getAuthorByName, getAuthorById } = require('../../helpers/get_author');
const { checkTags } = require('../../helpers/check_tags');
const QuoteSchema= require('../../schemas/quote_schema');
const checkURL = require('../../helpers/check_url')
const { Constants } = require('discord.js');

module.exports = {
    category:'Quotes',
    description: 'Edit a quote tied to your server.',
    name: 'edit_quote',
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

            let tags = [
                options.getString('first_tag'),
                options.getString('second_tag'),
                options.getString('third_tag'),
            ];

            tags = await checkTags(tags, guildId);
            
            if (tags.length) {
                updateObject.tags = tags
            }
    
            if (newAttatchment) {
                if (!checkURL(newAttatchment)) {
                    throw new Error('Please input a valid url.')
                }

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
            interaction.reply(errorEmbed(err))
            .catch(_ => interaction.channel.send(errorEmbed(err)))
        }
    }
};