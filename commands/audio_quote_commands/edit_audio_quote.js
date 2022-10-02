const { errorEmbed, quoteEmbed, basicEmbed } = require('../../helpers/embeds');
const { getAuthorByName, getAuthorById } = require('../../helpers/get_author');
const sendToQuotesChannel = require('../../helpers/send_to_quotes_channel')
const { getLastAudio } = require('../../helpers/get_last_attachment');
const audioQuoteSchema = require('../../schemas/audio_quote_schema');
const { checkTags } = require('../../helpers/check_tags');
const checkURL = require('../../helpers/check_url')
const { Constants } = require('discord.js');

module.exports = {
    category:'Audio Quotes',
    name: 'edit_audio_quote',
    description: 'Edit an audio quote. Quotes must have an author and can have up to three tags.',
    guildOnly: true,
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
        },
        {
            name: 'last_audio',
            description: 'Use the last audio file sent in a channel.',
            type: Constants.ApplicationCommandOptionTypes.CHANNEL
        }
    ],

    callback: async ({ interaction, client }) => {
        try {
            const { options } = interaction;
            const guildId  = interaction.guildId;
            const _id = options.getString('id');

            const audioQuote = await audioQuoteSchema.findOne({
                _id: _id,
                guildId: guildId,
                isAudioQuote: true,
            }).select('_id').lean()

            if (!audioQuote) {
                throw new Error('Quote does not exist.')
            }
    
            let updateObject = {};
    
            const newAudioFileLink = options.getString('new_audio_file_link');
            const lastAudioChannel = options.getChannel('last_audio');
            const deleteTags = options.getBoolean('delete_tags');
            const newAuthorName = options.getString('new_author');
            const newTitle = options.getString('new_title');

            if (newAudioFileLink) {
                if (!checkURL(newAudioFileLink)) {
                    throw new Error('Please input a valid url.')
                }

                updateObject.audioFileLink = newAudioFileLink;
            } else if (lastAudioChannel) {
                updateObject.audioFileLink = await getLastAudio(lastAudioChannel)
            }

            let tags = [
                options.getString('first_tag'),
                options.getString('second_tag'),
                options.getString('third_tag'),
            ];

            tags = await checkTags(tags, guildId);
            
            if (tags.length) {
                updateObject.tags = tags
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
                const updatedAudioQuote = await audioQuoteSchema.findOneAndUpdate(
                    { _id: _id },
                    updateObject
                ).lean()

                const author = await getAuthorById(updatedAudioQuote.authorId, guildId);

                const embeddedAudioQuote = quoteEmbed(updatedAudioQuote, author)

                await sendToQuotesChannel(embeddedAudioQuote, guildId, client)
                await interaction.reply(embeddedAudioQuote);
            } else {
                await interaction.reply(basicEmbed('Nothing Updated.'));
            }
        } catch(err) {
            interaction.reply(errorEmbed(err))
            .catch(_ => interaction.channel.send(errorEmbed(err)))
        }
    }
};