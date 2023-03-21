const { getLastAudio, getLastImage } = require('../../helpers/get-last-item');
const sendToQuotesChannel = require('../../helpers/send-to-quotes-channel');
const { InvalidInputError, NotFoundError } = require('../../errors');
const AudioQuoteSchema = require('../../schemas/audio-quote-schema');
const { getAuthorByName } = require('../../helpers/get-author');
const { quoteEmbed } = require('../../helpers/embeds');

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
            //type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 256
        },
        {
            name: 'title',
            description: 'Title of the audio quote.',
            required: true,
            //type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 4096
        },
        {
            name: 'audio_file_link',
            description: 'Must be a link to an audio file. You can upload the audio file to discord and copy that link.',
            //type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 512
        },
        {
            name: 'first_tag',
            description: 'Tags are used for filtering.',
            //type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 339
        },
        {
            name: 'second_tag',
            description: 'Tags are used for filtering.',
            //type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 339
        },
        {
            name: 'third_tag',
            description: 'Tags are used for filtering.',
            //type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 339
        },
        {
            name: 'last_audio',
            description: 'Use the last audio file sent in a channel.',
           // type: Constants.ApplicationCommandOptionTypes.CHANNEL
        },
        {
            name: 'image_link',
            description: 'Image attachment link. Upload an image to Discord and copy the link to that image.',
         //   type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 512
        },
        {
            name: 'last_image',
            description: 'Use the last image sent in a channel to the quote.',
           // type: Constants.ApplicationCommandOptionTypes.CHANNEL
        }
    ],

    callback: async ({ interaction, client }) => {
        const guildId = interaction.guildId;
        const { options } = interaction;
        const tags = [
            options.getString('first_tag'),
            options.getString('second_tag'),
            options.getString('third_tag'),
        ];
        
        const inputtedAuthor = options.getString('author');
        const checkedAuthor = await getAuthorByName(inputtedAuthor, guildId);
        
        if (checkedAuthor.name == 'Deleted Author') {
            throw new NotFoundError(inputtedAuthor)
        }
        
        const lastAudioChannel = options.getChannel('last_audio');
        const audioURL = options.getString('audio_file_link');
        const title = options.getString('title');
        const lastImageChannel = options.getChannel('last_image');
        let attachmentURL = options.getString('image_link');
        
        if (!lastAudioChannel && !audioURL) {
            throw new InvalidInputError('Audio')
        }

        if (!attachmentURL && lastImageChannel) {
            attachmentURL = await getLastImage(lastImageChannel)
        }

        const audioQuote = await AudioQuoteSchema.create({
            guildId: guildId,
            authorId: checkedAuthor._id,
            text: title,
            audioURL: audioURL ?? await getLastAudio(lastAudioChannel),
            tags: tags,
            attachmentURL: attachmentURL,
        });

        const embeddedAudioQuote = quoteEmbed(audioQuote, checkedAuthor)

        await sendToQuotesChannel(embeddedAudioQuote, guildId, client)
        await interaction.reply(embeddedAudioQuote);
    }
};