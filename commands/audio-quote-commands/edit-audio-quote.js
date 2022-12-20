const { getAuthorByName, getAuthorById } = require('../../helpers/get-author');
const { getLastAudio, getLastQuote} = require('../../helpers/get-last-item');
const sendToQuotesChannel = require('../../helpers/send-to-quotes-channel')
const audioQuoteSchema = require('../../schemas/audio-quote-schema');
const { quoteEmbed, basicEmbed } = require('../../helpers/embeds');
const errorHandler = require('../../helpers/error-handler');
const { checkTags } = require('../../helpers/check-tags');
const checkURL = require('../../helpers/check-url')
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
            type: Constants.ApplicationCommandOptionTypes.STRING,
            minLength: 24,
            maxLength: 24,
        },
        {
            name: 'new_author',
            description: 'Name of the new author. You must create an author beforehand.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 256
        },
        {
            name: 'new_title',
            description: 'New audio quote title.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 4096
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
            type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 339
        },
        {
            name: 'second_tag',
            description: 'Tags are used for filtering. You must create a tag beforehand. New tags will overwrite the old ones.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 339
        },
        {
            name: 'third_tag',
            description: 'Tags are used for filtering. You must create a tag beforehand. New tags will overwrite the old ones.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 339
        },
        {
            name: 'last_audio_file',
            description: 'Use the last audio file sent in a channel.',
            type: Constants.ApplicationCommandOptionTypes.CHANNEL
        },
        {
            name: 'last_quote',
            description: "Use the last quote sent in a channel. Will grab any type of quote.",
            type: Constants.ApplicationCommandOptionTypes.CHANNEL
        },
    ],

    callback: async ({ interaction, client }) => errorHandler(interaction, async () => {
        const { options } = interaction;
        const guildId  = interaction.guildId;
        const lastQuoteChannel = options.getChannel('last_quote');
        const _id = options.getString('id') ?? await getLastQuote(lastQuoteChannel)

        if (!_id) {
            throw new Error('Please provide a quote id or choose a channel to get the quote id from.')
        }

        const audioQuote = await audioQuoteSchema.findOne({
            _id: _id,
            guildId: guildId,
            type: 'audio',
        }).select('_id').lean()

        if (!audioQuote) {
            throw new Error('Audio quote does not exist.')
        }

        const update = {};
        
        const newAudioURL = options.getString('new_audio_file_link');
        const lastAudioChannel = options.getChannel('last_audio_file');
        const deleteTags = options.getBoolean('delete_tags');
        const newAuthorName = options.getString('new_author');
        const newTitle = options.getString('new_title');

        if (newAudioURL) {
            if (!checkURL(newAudioURL)) {
                throw new Error('Please input a valid url.')
            }

            update.audioURL = newAudioURL;
        } else if (lastAudioChannel) {
            update.audioURL = await getLastAudio(lastAudioChannel)
        }

        let tags = [
            options.getString('first_tag'),
            options.getString('second_tag'),
            options.getString('third_tag'),
        ];

        tags = await checkTags(tags, guildId);
        
        if (tags.length) {
            update.tags = tags
        }

        if (deleteTags) {
            update['tags'] = [];
        }

        if (newTitle) {
            update['text'] = newTitle;
        }
        
        if (newAuthorName) {
            const author = await getAuthorByName(newAuthorName, guildId);
            if (author.name == 'Deleted Author') {
                throw new Error('Author does not exist.')
            }

            update['authorId'] = author._id;
        }
        
        if (!Object.keys(update).length) {
            throw new Error('No updates.')
        }

        const updatedAudioQuote = await audioQuoteSchema.findOneAndUpdate(
            { _id: _id },
            update
        ).lean()

        const author = await getAuthorById(updatedAudioQuote.authorId, guildId);

        const embeddedAudioQuote = quoteEmbed(updatedAudioQuote, author)

        await sendToQuotesChannel(embeddedAudioQuote, guildId, client)
        await interaction.reply(embeddedAudioQuote);
    })
};