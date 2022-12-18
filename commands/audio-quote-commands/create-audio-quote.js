const sendToQuotesChannel = require('../../helpers/send-to-quotes-channel');
const AudioQuoteSchema = require('../../schemas/audio-quote-schema');
const { getLastAudio } = require('../../helpers/get-last-item');
const { getAuthorByName } = require('../../helpers/get-author');
const errorHandler = require('../../helpers/error-handler');
const { checkTags } = require('../../helpers/check-tags');
const { quoteEmbed } = require('../../helpers/embeds');
const checkURL = require('../../helpers/check-url')
const { Constants } = require('discord.js');

module.exports = {
    category:'Audio Quotes',
    name: 'create_audio_quote',
    description: 'Create an audio quote. Quotes must have an author and can have up to three tags.',
    guildOnly: true,
    slash: true,

    options: [
        {
            name: 'author',
            description: 'The name of who said the quote. You must first register an author with /createauthor.',
            required: true,
            type: Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'title',
            description: 'Title of the audio quote.',
            required: true,
            type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'audio_file_link',
            description: 'Must be a link to an audio file. You can upload the audio file to discord and copy that link.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'first_tag',
            description: 'Tags are used for filtering.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'second_tag',
            description: 'Tags are used for filtering.',
            type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'third_tag',
            description: 'Tags are used for filtering.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'last_audio',
            description: 'Use the last audio file sent in a channel.',
            type: Constants.ApplicationCommandOptionTypes.CHANNEL
        }
    ],

    callback: async ({ interaction, client }) => errorHandler(interaction, async () => {
        const guildId = interaction.guildId;
        const { options } = interaction;
        
        const inputtedAuthor = options.getString('author');
        const checkedAuthor = await getAuthorByName(inputtedAuthor, guildId);
        
        if (checkedAuthor.name == 'Deleted Author') {
            throw new Error(`Make sure that '${inputtedAuthor}' author exists.`)
        }
        
        const lastAudioChannel = options.getChannel('last_audio');
        const title = options.getString('title');
        const audioURL = options.getString('audio_file_link');
        
        if (!lastAudioChannel && !audioURL) {
            throw new Error('Please provide an audio file link or choose a channel to get the audio file from.')
        }

        if (audioURL && !checkURL(audioURL)) {
            throw new Error('Please input a valid url.')
        }

        let tags = [
            options.getString('first_tag'),
            options.getString('second_tag'),
            options.getString('third_tag'),
        ];

        tags = await checkTags(tags, guildId);

        const audioQuote = await AudioQuoteSchema.create({
            guildId: guildId,
            authorId: checkedAuthor._id,
            text: title,
            audioURL: audioURL ?? await getLastAudio(lastAudioChannel),
            tags: tags,
            type: 'audio'
        });

        const embeddedAudioQuote = quoteEmbed(audioQuote, checkedAuthor)

        await sendToQuotesChannel(embeddedAudioQuote, guildId, client)
        await interaction.reply(embeddedAudioQuote);
    })
};