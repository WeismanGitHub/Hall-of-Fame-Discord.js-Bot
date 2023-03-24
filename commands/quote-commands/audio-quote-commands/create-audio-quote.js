const { getLastAudio, getLastImage } = require('../../../helpers/get-last-item');
const sendToQuotesChannel = require('../../../helpers/send-to-quotes-channel');
const { InvalidInputError, NotFoundError } = require('../../../errors');
const AudioQuoteSchema = require('../../../schemas/audio-quote-schema');
const { getAuthorByName } = require('../../../helpers/get-author');
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
} = require('../../../descriptions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('create_audio_quote')
		.setDescription('Create an audio quote. Quotes must have an author and can have up to three tags.')
        .setDMPermission(false)
        .addStringOption(option => option
            .setName('author')
            .setDescription(authorDescription)
            .setMaxLength(256)
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('title')
            .setDescription(titleDescription)
            .setMaxLength(4096)
        )
        .addStringOption(option => option
            .setName('audio_file_link')
            .setDescription(audioFileLinkDescription)
            .setMaxLength(512)
        )
        .addChannelOption(option => option
            .setName('last_audio')
            .setDescription(lastAudioDescription)
            .addChannelTypes(ChannelType.GuildText)
        )
        .addStringOption(option => option
            .setName('image_link')
            .setDescription(imageLinkDescription)
            .setMaxLength(512)
        )
        .addChannelOption(option => option
            .setName('last_image')
            .setDescription(lastImageDescription)
            .addChannelTypes(ChannelType.GuildText)
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