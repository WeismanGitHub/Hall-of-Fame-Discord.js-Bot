const sendToQuotesChannel = require('../../helpers/send-to-quotes-channel')
const { errorEmbed, quoteEmbed } = require('../../helpers/embeds');
const { getAuthorByName } = require('../../helpers/get-author');
const { getLastImage } = require('../../helpers/get-last-item');
const { checkTags } = require('../../helpers/check-tags');
const QuoteSchema = require('../../schemas/quote-schema');
const checkURL = require('../../helpers/check-url')
const { Constants } = require('discord.js');

module.exports = {
    category:'Quotes',
    name: 'create_quote',
    description: 'Create a quote. Quotes must have an author and can have up to three tags.',
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
            name: 'text',
            description: 'What was said by the person.',
            type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'image_link',
            description: 'Image attachment link. Upload an image to Discord and copy the link to that image.',
            type: Constants.ApplicationCommandOptionTypes.STRING
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
            name: 'last_image',
            description: 'Add the last image sent in a channel to the quote.',
            type: Constants.ApplicationCommandOptionTypes.CHANNEL
        }
    ],

    callback: async ({ interaction, client }) => {
        try {
            const { options } = interaction;
            const guildId = interaction.guildId;
    
            const inputtedAuthor = options.getString('author');
            const checkedAuthor = await getAuthorByName(inputtedAuthor, guildId);

            if (checkedAuthor.name == 'Deleted Author') {
                throw new Error(`Make sure that '${inputtedAuthor}' author exists.`)
            }

            const text = options.getString('text');
            const lastImageChannel = options.getChannel('last_image');
            const imageLink = options.getString('image_link');

            if (!text && !imageLink && !lastImageChannel) {
                throw new Error('Please provide text and or an image link.')
            }

            let tags = [
                options.getString('first_tag'),
                options.getString('second_tag'),
                options.getString('third_tag'),
            ];

            tags = await checkTags(tags, guildId);
            
            if (imageLink) {
                if (!checkURL(imageLink)) {
                    throw new Error('Please input a valid url.')
                }
                
                var quote = await QuoteSchema.create({
                    guildId: guildId,
                    authorId: checkedAuthor._id,
                    tags: tags,
                    text: text,
                    attachment: imageLink
                });
            } else if (lastImageChannel) {
                const firstImageUrl = await getLastImage(lastImageChannel)

                var quote = await QuoteSchema.create({
                    guildId: guildId,
                    authorId: checkedAuthor._id,
                    tags: tags,
                    text: text,
                    attachment: firstImageUrl
                });
            } else {
                var quote = await QuoteSchema.create({
                    guildId: guildId,
                    authorId: checkedAuthor._id,
                    tags: tags,
                    text: text,
                });
            }

            const embeddedQuote = quoteEmbed(quote, checkedAuthor)

            await sendToQuotesChannel(embeddedQuote, guildId, client)
            await interaction.reply(embeddedQuote);
        } catch(err) {
            interaction.reply(errorEmbed(err))
            .catch(_ => interaction.channel.send(errorEmbed(err)))
        }
    }
};