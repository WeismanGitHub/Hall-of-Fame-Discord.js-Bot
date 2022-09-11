const { errorEmbed, quoteEmbed } = require('../../helpers/embeds');
const { getAuthorByName } = require('../../helpers/get_author');
const { checkTags } = require('../../helpers/check_tags');
const QuoteSchema = require('../../schemas/quote_schema');
const checkURL = require('../../helpers/check_url')
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
            name: 'attachment',
            description: 'Image attachment. Must be a link.',
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
        }
    ],

    callback: async ({ interaction }) => {
        try {
            const { options } = interaction;
            const guildId = interaction.guildId;
    
            const inputtedAuthor = options.getString('author');
            
            const checkedAuthor = await getAuthorByName(inputtedAuthor, guildId);

            if (checkedAuthor.name !== 'Deleted Author') {
                const text = options.getString('text');
                const attachmentLink = options.getString('attachment');

                if (!text && !attachmentLink) {
                    throw new Error('Please provide either at least text or an attachment.')
                }

                let tags = [
                    options.getString('first_tag'),
                    options.getString('second_tag'),
                    options.getString('third_tag'),
                ];
    
                tags = await checkTags(tags, guildId);
                
                if (attachmentLink) {
                    if (!checkURL(attachmentLink)) {
                        throw new Error('Please input a valid url.')
                    }
                    
                    var quote = await QuoteSchema.create({
                        guildId: guildId,
                        authorId: checkedAuthor._id,
                        tags: tags,
                        text: text,
                        attachment: attachmentLink
                    });
                } else {
                    var quote = await QuoteSchema.create({
                        guildId: guildId,
                        authorId: checkedAuthor._id,
                        tags: tags,
                        text: text,
                    });
                }

                await interaction.reply(quoteEmbed(quote, checkedAuthor));
    
            } else {
                throw new Error(`Make sure that '${inputtedAuthor}' author exists.`)
            }
        } catch(err) {
            interaction.reply(errorEmbed(err))
            .catch(_ => interaction.channel.send(errorEmbed(err)))
        }
    }
};