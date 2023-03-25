const sendToQuotesChannel = require('../../../helpers/send-to-quotes-channel');
const MultiQuoteSchema = require('../../../schemas/multi-quote-schema');
const { getAuthorByName } = require('../../../helpers/get-author');
const { getLastImage } = require('../../../helpers/get-last-item');
const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { quoteEmbed } = require('../../../helpers/embeds');
const { NotFoundError } = require('../../../errors');
const client = require('../../../index')
const {
    authorDescription,
    tagDescription,
    lastImageDescription,
    imageLinkDescription,
    titleDescription,
    textDescription
} = require('../../../descriptions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('create_multi_quote')
		.setDescription('Multi-quotes have multiple quotes from multiple authors within them.')
        .setDMPermission(false)
        .addStringOption(option => option
            .setName('title')
            .setDescription(titleDescription)
            .setMaxLength(4096)
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('first_author')
            .setDescription(authorDescription)
            .setMaxLength(256)
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('first_text')
            .setDescription(textDescription)
            .setMaxLength(819)
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('second_author')
            .setDescription(authorDescription)
            .setMaxLength(256)
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('second_text')
            .setDescription(textDescription)
            .setMaxLength(819)
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('third_author')
            .setDescription(authorDescription)
            .setMaxLength(256)
        )
        .addStringOption(option => option
            .setName('third_text')
            .setDescription(textDescription)
            .setMaxLength(819)
        )
        .addStringOption(option => option
            .setName('fourth_author')
            .setDescription(authorDescription)
            .setMaxLength(256)
        )
        .addStringOption(option => option
            .setName('fourth_text')
            .setDescription(textDescription)
            .setMaxLength(819)
        )
        .addStringOption(option => option
            .setName('fifth_author')
            .setDescription(authorDescription)
            .setMaxLength(256)
        )
        .addStringOption(option => option
            .setName('fifth_text')
            .setDescription(textDescription)
            .setMaxLength(819)
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

        const fragments = [
            { text: options.getString('first_text'), authorName: options.getString('first_author') },
            { text: options.getString('second_text'), authorName: options.getString('second_author') },
            { text: options.getString('third_text'), authorName: options.getString('third_author') },
            { text: options.getString('fourth_text'), authorName: options.getString('fourth_author') },
            { text: options.getString('fifth_text'), authorName: options.getString('fifth_author') },
        ]
        
        const checkedFragments = []

        for (let fragment of fragments) {
            if ([fragment.text, fragment.authorName].includes(null)) {
                continue
            }

            const author = await getAuthorByName(fragment.authorName, guildId)
            
            if (author.name == 'Deleted Author') {
                throw new NotFoundError(fragment.authorName)
            }

            fragment.authorId = author._id
            checkedFragments.push(fragment)
        }
        
        const lastImageChannel = options.getChannel('last_image');
        let attachmentURL = options.getString('image_link');

        if (!attachmentURL && lastImageChannel) {
            attachmentURL = await getLastImage(lastImageChannel)
        }

        const multiQuote = await MultiQuoteSchema.create({
            guildId: guildId,
            text: options.getString('title'),
            fragments: checkedFragments,
            tags: tags,
            attachmentURL: attachmentURL
        });

        const embeddedMultiQuote = quoteEmbed(multiQuote, checkedFragments)

        await sendToQuotesChannel(embeddedMultiQuote, guildId, client)
        await interaction.reply(embeddedMultiQuote);
    }
};