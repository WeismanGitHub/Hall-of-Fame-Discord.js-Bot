const { errorEmbed, quoteEmbed, basicEmbed } = require('../../helpers/embeds');
const { getAuthorByName, getAuthorById } = require('../../helpers/get_author');
const { checkTags } = require('../../helpers/check_tags');
const QuoteSchema= require('../../schemas/quote_schema');
const checkURL = require('../../helpers/check_url')
const { Constants } = require('discord.js');

module.exports = {
    category:'Quotes',
    name: 'edit_quote',
    description: 'Edit a quote. Quotes must have an author and can have up to three tags.',
    guildOnly: true,
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
            name: 'new_image_link',
            description: 'Image attachment link. Upload an image to Discord and copy the link to that image.',
            type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'delete_tags',
            description: 'Removes tags from quote.',
            type: Constants.ApplicationCommandOptionTypes.BOOLEAN
        },
        {
            name: 'delete_image',
            description: 'Removes image from quote.',
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
        },
        {
            name: 'last_image',
            description: 'Add the last image sent in a channel to the quote.',
            type: Constants.ApplicationCommandOptionTypes.CHANNEL
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
    
            const lastImageChannel = options.getChannel('last_image');
            const newImageLink = options.getString('new_image_link');
            const deleteImage = options.getBoolean('delete_image');
            const deleteTags = options.getBoolean('delete_tags');
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
    
            if (newImageLink) {
                if (!checkURL(newImageLink)) {
                    throw new Error('Please input a valid url.')
                }

                updateObject.attachment = newImageLink;
            } else if (lastImageChannel) {
                (await lastImageChannel.messages.fetch({ limit: 25 }))
                .find(message => message.attachments.find(attachment => {
                    updateObject.attachment = attachment.proxyURL
                    return Boolean(attachment)
                }))

                if (!updateObject.attachment) {
                    throw new Error('No attachment could be found in the last 25 messages.')
                }
            }

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
            
            
            if (deleteImage) {
                updateObject.$unset = {'attachment': '' }
            }

            if (Object.keys(updateObject).length || deleteImage) {
                const updatedQuote = await QuoteSchema.findOneAndUpdate(
                    { _id: _id, guildId: guildId },
                    updateObject
                ).lean()

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