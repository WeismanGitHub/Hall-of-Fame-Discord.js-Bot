const { getAuthorByName, getAuthorById } = require('../../../helpers/get-author');
const sendToQuotesChannel = require('../../../helpers/send-to-quotes-channel');
const MultiQuoteSchema = require('../../../schemas/multi-quote-schema');
const { NotFoundError, InvalidInputError } = require('../../../errors');
const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { quoteEmbed } = require('../../../helpers/embeds');
const client = require('../../../index')
const {
    authorDescription,
    tagDescription,
    lastImageDescription,
    imageLinkDescription,
    titleDescription,
    textDescription,
    idDescription,
    removeTagsDescription,
    fragmentDescription,
    removeImageDescription,
} = require('../../../descriptions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('edit_multi_quote')
		.setDescription('Multi-quotes have multiple quotes from multiple authors within them.')
        .setDMPermission(false)
        .addStringOption(option => option
            .setName('id')
            .setDescription(idDescription)
            .setMaxLength(24)
            .setMinLength(24)
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('new_title')
            .setDescription(titleDescription)
            .setMaxLength(4096)
        )
        .addStringOption(option => option
            .setName('first_author')
            .setDescription(authorDescription)
            .setMaxLength(256)
        )
        .addStringOption(option => option
            .setName('first_text')
            .setDescription(textDescription)
            .setMaxLength(819)
        )
        .addStringOption(option => option
            .setName('second_author')
            .setDescription(authorDescription)
            .setMaxLength(256)
        )
        .addStringOption(option => option
            .setName('second_text')
            .setDescription(textDescription)
            .setMaxLength(819)
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
        .addBooleanOption(option => option
            .setName('delete_first_fragment')
            .setDescription(fragmentDescription)
        )
        .addBooleanOption(option => option
            .setName('delete_second_fragment')
            .setDescription(fragmentDescription)
        )
        .addBooleanOption(option => option
            .setName('delete_third_fragment')
            .setDescription(fragmentDescription)
        )
        .addBooleanOption(option => option
            .setName('delete_fourth_fragment')
            .setDescription(fragmentDescription)
        )
        .addBooleanOption(option => option
            .setName('delete_fifth_fragment')
            .setDescription(fragmentDescription)
        )
	,
	execute: async (interaction) => {
        const guildId = interaction.guildId;
        const { options } = interaction;

        if (!options._hoistedOptions) {
            throw new InvalidInputError('No Changes')
        }

        const tags = [
            options.getString('first_tag'),
            options.getString('second_tag'),
            options.getString('third_tag'),
        ];

        const id = options.getString('id')
        const newTitle = options.getString('new_title')
        const lastImageChannel = options.getChannel('last_image');
        const newImageLink = options.getString('new_image_link');
        const deleteImage = options.getBoolean('remove_image');

        if (!id) {
            throw new InvalidInputError('ID')
        }

        const multiQuote = await MultiQuoteSchema.findOne({
            guildId: guildId,
            _id: id,
            type: 'multi'
        })

        if (!multiQuote) {
            throw new NotFoundError('Multi-Quote')
        }
        
        if (tags.some(tag => tag !== null)) {
            multiQuote.tags = tags
        }

        if (options.getString('remove_tags')) {
            multiQuote.tags = [];
        }

        if (newTitle) {
            multiQuote.text = newTitle;
        }

        if (deleteImage) {
            multiQuote.attachmentURL = null
        } else if (newImageLink) {
            multiQuote.attachmentURL = newImageLink;
        } else if (lastImageChannel) {
            multiQuote.attachmentURL = await getLastImage(lastImageChannel)
        }

        const deleteFragmentOptions = [
            options.getBoolean('delete_first_fragment'),
            options.getBoolean('delete_second_fragment'),
            options.getBoolean('delete_third_fragment'),
            options.getBoolean('delete_fourth_fragment'),
            options.getBoolean('delete_fifth_fragment'),
        ]

        const newFragments = [
            { text: options.getString('first_text'), authorName: options.getString('first_author') },
            { text: options.getString('second_text'), authorName: options.getString('second_author') },
            { text: options.getString('third_text'), authorName: options.getString('third_author') },
            { text: options.getString('fourth_text'), authorName: options.getString('fourth_author') },
            { text: options.getString('fifth_text'), authorName: options.getString('fifth_author') },
        ]

        const updatedFragments = []

        for (let i = 0; i < 5; i++) {
            const oldFragment = multiQuote.toObject().fragments[i]
            const newFragment = newFragments[i]
            const updatedFragment = oldFragment

            if (!oldFragment || deleteFragmentOptions[i]) {
                continue
            }

            if (newFragment.authorName) {
                const author = await getAuthorByName(newFragment.authorName, guildId)
                updatedFragment.authorName = newFragment.authorName

                if (author.name == 'Deleted Author') {
                    throw new NotFoundError(newFragment.authorName)
                }

                updatedFragment.authorId = author._id
            } else {
                updatedFragment.authorName = (await getAuthorById(oldFragment.authorId, guildId)).name
            }
            
            if (newFragment.text) {
                updatedFragment.text = newFragment.text
            }

            updatedFragments.push(updatedFragment)
        }

        multiQuote.fragments = updatedFragments
        await multiQuote.save()

        const embeddedMultiQuote = quoteEmbed(multiQuote, updatedFragments)

        await sendToQuotesChannel(embeddedMultiQuote, guildId, client)
        await interaction.reply(embeddedMultiQuote);
    }
};