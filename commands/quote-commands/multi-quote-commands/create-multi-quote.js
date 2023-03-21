const sendToQuotesChannel = require('../../../helpers/send-to-quotes-channel');
const MultiQuoteSchema = require('../../../schemas/multi-quote-schema');
const { getAuthorByName } = require('../../../helpers/get-author');
const { getLastImage } = require('../../../helpers/get-last-item');
const { quoteEmbed } = require('../../../helpers/embeds');
const { NotFoundError } = require('../../../errors');
const client = require('../../../index')

module.exports = {
    category:'Multi Quotes',
    name: 'create_multi_quote',
    description: 'Multi-quotes have multiple quotes from multiple authors within them.',
    guildOnly: true,
    slash: true,

    options: [
        {
            name: 'title',
            description: 'Title of the multi-quote.',
            required: true,
    //        type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'first_author',
            description: 'The name of the first author.',
     //       type: Constants.ApplicationCommandOptionTypes.STRING,
            required: true,
        },
        {
            name: 'first_text',
            description: 'The first part of the multi-quote.',
     //       type: Constants.ApplicationCommandOptionTypes.STRING,
            required: true,
        },
        {
            name: 'second_author',
            description: 'The name of the second author.',
     //       type: Constants.ApplicationCommandOptionTypes.STRING,
            required: true,
        },
        {
            name: 'second_text',
            description: 'The second part of the multi-quote.',
      //      type: Constants.ApplicationCommandOptionTypes.STRING,
            required: true,
        },
        {
            name: 'first_tag',
            description: 'Tags are used for filtering.',
     //       type: Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'second_tag',
            description: 'Tags are used for filtering.',
      //      type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'third_tag',
            description: 'Tags are used for filtering.',
       //     type: Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'third_author',
            description: 'The name of the third author.',
    //        type: Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'third_text',
            description: 'The third part of the multi-quote.',
      //      type: Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'fourth_author',
            description: 'The name of the fourth author.',
     //       type: Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'fourth_text',
            description: 'The fourth part of the multi-quote.',
   //         type: Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'fifth_author',
            description: 'The name of the fifth author.',
      //      type: Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'fifth_text',
            description: 'The fifth part of the multi-quote.',
     //       type: Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'image_link',
            description: 'Image attachment link. Upload an image to Discord and copy the link to that image.',
    //        type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 512
        },
        {
            name: 'last_image',
            description: 'Use the last image sent in a channel to the quote.',
    //        type: Constants.ApplicationCommandOptionTypes.CHANNEL
        }
    ],

    callback: async (interaction) => {
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