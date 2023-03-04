const { getLastAudio, getLastQuoteId, getLastImage } = require('../../helpers/get-last-item');
const { getAuthorByName, getAuthorById } = require('../../helpers/get-author');
const sendToQuotesChannel = require('../../helpers/send-to-quotes-channel')
const AudioQuoteSchema = require('../../schemas/audio-quote-schema');
const { InvalidInputError, NotFoundError } = require('../../errors');
const errorHandler = require('../../helpers/error-handler');
const { quoteEmbed } = require('../../helpers/embeds');
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
            type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 512
        },
        {
            name: 'remove_tags',
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
            name: 'last_audio',
            description: 'Use the last audio file sent in a channel.',
            type: Constants.ApplicationCommandOptionTypes.CHANNEL
        },
        {
            name: 'last_quote',
            description: "Use the last quote sent in a channel. Will grab any type of quote.",
            type: Constants.ApplicationCommandOptionTypes.CHANNEL
        },
        {
            name: 'new_image_link',
            description: 'Image attachment link. Upload an image to Discord and copy the link to that image.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 512
        },
        {
            name: 'last_image',
            description: 'Add the last image sent in a channel to the quote.',
            type: Constants.ApplicationCommandOptionTypes.CHANNEL
        },
        {
            name: 'remove_image',
            description: 'Removes image from quote.',
            type: Constants.ApplicationCommandOptionTypes.BOOLEAN
        },
    ],

    callback: async ({ interaction, client }) => errorHandler(interaction, async () => {
        const { options } = interaction;
        const guildId  = interaction.guildId;
        const lastQuoteChannel = options.getChannel('last_quote');
        const id = options.getString('id') ?? await getLastQuoteId(lastQuoteChannel)
        const tags = [
            options.getString('first_tag'),
            options.getString('second_tag'),
            options.getString('third_tag'),
        ];
        
        if (!id) {
            throw new InvalidInputError('ID')
        }

        const newAudioURL = options.getString('new_audio_file_link');
        const lastAudioChannel = options.getChannel('last_audio');
        const deleteTags = options.getBoolean('remove_tags');
        const newAuthorName = options.getString('new_author');
        const newTitle = options.getString('new_title');
        const update = { guildId: guildId };
        const lastImageChannel = options.getChannel('last_image');
        const newImageLink = options.getString('new_image_link');
        const deleteImage = options.getBoolean('remove_image');
        
        if (newAudioURL) {
            update.audioURL = newAudioURL;
        } else if (lastAudioChannel) {
            update.audioURL = await getLastAudio(lastAudioChannel)
        }

        if (deleteImage) {
            update.attachmentURL = null
        } else if (newImageLink) {
            update.attachmentURL = newImageLink;
        } else if (lastImageChannel) {
            update.attachmentURL = await getLastImage(lastImageChannel)
        }
        
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
                throw new NotFoundError(newAuthorName)
            }

            update['authorId'] = author._id;
        }
        
        if (!Object.keys(update).length) {
            throw new InvalidInputError('No Parameters')
        }

        
        const audioQuote = await AudioQuoteSchema.findOneAndUpdate(
            { _id: id, guildId: guildId, type: 'audio' },
            update
        ).lean()
            
        if (!audioQuote) {
            throw new NotFoundError('Audio Quote')
        }

        const author = await getAuthorById(audioQuote.authorId, guildId);

        const embeddedAudioQuote = quoteEmbed(audioQuote, author)

        await sendToQuotesChannel(embeddedAudioQuote, guildId, client)
        await interaction.reply(embeddedAudioQuote);
    })
};