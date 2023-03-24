const { getLastAudio, getLastQuoteId, getLastImage } = require('../../../helpers/get-last-item');
const { getAuthorByName, getAuthorById } = require('../../../helpers/get-author');
const sendToQuotesChannel = require('../../../helpers/send-to-quotes-channel')
const AudioQuoteSchema = require('../../../schemas/audio-quote-schema');
const { InvalidInputError, NotFoundError } = require('../../../errors');
const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { quoteEmbed } = require('../../../helpers/embeds');
const {
    authorDescription,
    tagDescription,
    lastImageDescription,
    imageLinkDescription,
    titleDescription,
    audioFileLinkDescription,
    lastAudioDescription,
    lastQuoteDescription,
    idDescription,
    removeImageDescription,
    removeTagsDescription,
} = require('../../../descriptions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('edit_audio_quote')
		.setDescription('Edit an audio quote. Quotes must have an author and can have up to three tags.')
        .setDMPermission(false)
        .addStringOption(option => option
            .setName('id')
            .setDescription(idDescription)
            .setMaxLength(24)
            .setMinLength(24)
        )
        .addChannelOption(option => option
            .setName('last_quote')
            .setDescription(lastQuoteDescription)
            .addChannelTypes(ChannelType.GuildText)
        )
        .addStringOption(option => option
            .setName('new_author')
            .setDescription(authorDescription)
            .setMaxLength(256)
        )
        .addStringOption(option => option
            .setName('new_title')
            .setDescription(titleDescription)
            .setMaxLength(4096)
        )
        .addStringOption(option => option
            .setName('new_audio_file_link')
            .setDescription(audioFileLinkDescription)
            .setMaxLength(512)
        )
        .addChannelOption(option => option
            .setName('last_audio')
            .setDescription(lastAudioDescription)
            .addChannelTypes(ChannelType.GuildText)
        )
        .addBooleanOption(option => option
            .setName('remove_image')
            .setDescription(removeImageDescription)
        )
        .addStringOption(option => option
            .setName('new_image_link')
            .setDescription(imageLinkDescription)
            .setMaxLength(512)
        )
        .addChannelOption(option => option
            .setName('last_image')
            .setDescription(lastImageDescription)
            .addChannelTypes(ChannelType.GuildText)
        )
        .addBooleanOption(option => option
            .setName('remove_tags')
            .setDescription(removeTagsDescription)
        )
        .addStringOption(option => option
            .setName('first_tag')
            .setDescription(tagDescription)
            .setMaxLength(339)
        )
        .addStringOption(option => option
            .setName('second_tag')
            .setDescription(tagDescription)
            .setMaxLength(339)
        )
        .addStringOption(option => option
            .setName('third_tag')
            .setDescription(tagDescription)
            .setMaxLength(339)
        )
	,
	execute: async (interaction) => {
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
        const lastImageChannel = options.getChannel('last_image');
        const newImageLink = options.getString('new_image_link');
        const deleteImage = options.getBoolean('remove_image');
        const update = {};
        
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
        
        if (tags.some(tag => tag !== null)) {
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
            throw new InvalidInputError('No Changes')
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
    }
};
