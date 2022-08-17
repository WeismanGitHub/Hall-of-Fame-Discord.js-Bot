const audioQuoteSchema = require('../../schemas/audio-quote-schema');
const GuildSchema = require('../../schemas/guild-schema');
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
    category:'Audio Quotes',
    description: 'Edit an audio quote tied to your server.',
    name: 'editaudioquote',
    slash: true,

    options: [
        {
            name: 'id',
            description: 'The id of the audio quote.',
            required: true,
            type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'new_author',
            description: 'Name of the new author. You must create an author beforehand.',
            type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'new_title',
            description: 'New audio quote title.',
            type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'new_audio_file_link',
            description: 'New audio file link.',
            type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'delete_tags',
            description: 'Removes tags from audio quote.',
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

            const audioQuote = await audioQuoteSchema.findOne({
                _id: _id,
                guildId: guildId,
                isAudioQuote: true,
            });

            if (!audioQuote) {
                throw new Error('Quote does not exist.')
            }
    
            let updateObject = {};
    
            const newAudioFile = options.getString('new_audio_file_link');
            const deleteTags = options.getBoolean('delete_tags');
            const newAuthorName = options.getString('new_author');
            const newTitle = options.getString('new_title');

            if (newAudioFile) {
                updateObject.audioFileLink = newAudioFile;
            };

            const uncheckedTags = [
                options.getString('first_tag'),
                options.getString('second_tag'),
                options.getString('third_tag'),
            ];
            
            const thereAreNewTags = uncheckedTags.some(tag => tag !== null);
            
            if (thereAreNewTags) {
                const guildTags = (await GuildSchema.findOne({ guildId: guildId }).select('tags')).tags;
                let checkedTagsObject = await checkTags(uncheckedTags, guildTags)

                if (checkedTagsObject.tagsExist) {
                    updateObject['tags'] = checkedTagsObject.checkedTags
                } else {
                    throw new Error('Make sure all your tags exist.')
                }
            }

            if (deleteTags) {
                updateObject['tags'] = [];
            }
    
            if (newTitle) {
                updateObject['text'] = newTitle;
            }
            
            if (newAuthorName) {
                const author = await getAuthorByName(newAuthorName, guildId);
                if (author.name == 'Deleted Author') {
                    throw new Error('Author does not exist.')
                }
    
                updateObject['authorId'] = author._id;
            }
            
            if (Object.keys(updateObject).length) {
                const updatedAudioQuote = await audioQuoteSchema.findOneAndUpdate({
                    _id: _id,
                    guildId: guildId
                }, updateObject, { new: true });

                const author = await getAuthorById(updatedAudioQuote.authorId, guildId);
    
                await interaction.reply(quoteEmbed(updatedAudioQuote, author))
    
            } else {
                await interaction.reply(basicEmbed('Nothing Updated.'));
            }
            
        } catch(err) {
            await interaction.reply(errorEmbed(err))
        };

    }
};