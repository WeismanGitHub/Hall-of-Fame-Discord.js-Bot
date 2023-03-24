const sendToQuotesChannel = require('../../../helpers/send-to-quotes-channel')
const { getAuthorByName } = require('../../../helpers/get-author');
const { getLastImage } = require('../../../helpers/get-last-item');
const { SlashCommandBuilder, ChannelType } = require('discord.js');
const QuoteSchema = require('../../../schemas/quote-schema');
const { quoteEmbed } = require('../../../helpers/embeds');
const { NotFoundError } = require('../../../errors') ;
const client = require('../../../index')
const {
    authorDescription,
    tagDescription,
    lastImageDescription,
    imageLinkDescription,
    textDescription,
} = require('../../../descriptions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('create_quote')
		.setDescription('Create a quote. Quotes must have an author and can have up to three tags.')
        .setDMPermission(false)
        .addStringOption(option => option
            .setName('author')
            .setDescription(authorDescription)
            .setMaxLength(256)
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('text')
            .setDescription(textDescription)
            .setMaxLength(4096)
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
        const inputtedAuthor = options.getString('author')
        const tags = [
            options.getString('first_tag'),
            options.getString('second_tag'),
            options.getString('third_tag'),
        ];

        const author = await getAuthorByName(inputtedAuthor, guildId);
        
        if (author.name == 'Deleted Author') {
            throw new NotFoundError(inputtedAuthor)
        }

        const lastImageChannel = options.getChannel('last_image');
        let attachmentURL = options.getString('image_link');
        const text = options.getString('text');
        
        if (!attachmentURL && lastImageChannel) {
            attachmentURL = await getLastImage(lastImageChannel)
        }

        const quote = await QuoteSchema.create({
            guildId: guildId,
            authorId: author._id,
            tags: tags,
            text: text,
            attachmentURL: attachmentURL
        });

        const embeddedQuote = quoteEmbed(quote, author)

        await sendToQuotesChannel(embeddedQuote, guildId, client)
        await interaction.reply(embeddedQuote);
    }
};