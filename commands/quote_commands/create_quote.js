const {errorEmbed, quoteEmbed, getAuthorByName, checkTags} = require('../../functions');
const GuildSchema = require('../../schemas/guild-schema');
const QuoteSchema = require('../../schemas/quote-schema');
const {Constants} = require('discord.js');

module.exports = {
    category:'Quotes',
    description: 'Creates a quote tied to your server.',
    name: 'createquote',
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

    callback: async ({interaction}) => {
        try {
            const {options} = interaction;
            const guildId = interaction.guildId;
    
            const inputtedAuthor = options.getString('author');
            
            const checkedAuthor = await getAuthorByName(inputtedAuthor, guildId);

            if (checkedAuthor.name !== 'Deleted Author') {
                const text = options.getString('text');
                const attachmentLink = options.getString('attachment');

                if (!text && !attachmentLink) {
                    throw new Error('Please provide either at least text or an attachment.')
                }

                const uncheckedTags = [
                    options.getString('first_tag'),
                    options.getString('second_tag'),
                    options.getString('third_tag'),
                ];
                
                const thereAreTags = uncheckedTags.some(tag => tag !== null);
                let checkedTags = [];
                
                if (thereAreTags) {
                    const guildTags = (await GuildSchema.findOne({guildId: guildId}).select('tags')).tags;
                    let checkedTagsObject = await checkTags(uncheckedTags, guildTags)
                    
                    if (checkedTagsObject.tagsExist) {
                        checkedTags = checkedTagsObject.checkedTags
                    } else {
                        await interaction.reply(errorEmbed('Make sure all your tags exist.'))
                        return;
                    }
                }
                
                if (attachmentLink) {
                    var quote = await QuoteSchema.create({
                        guildId: guildId,
                        authorId: checkedAuthor._id,
                        tags: checkedTags,
                        text: text,
                        attachment: attachmentLink
                    });
                } else {
                    var quote = await QuoteSchema.create({
                        guildId: guildId,
                        authorId: checkedAuthor._id,
                        tags: checkedTags,
                        text: text,
                    });
                }

                await interaction.reply(quoteEmbed(quote, checkedAuthor));
    
            } else {
                await interaction.reply(errorEmbed(`Make sure that '${inputtedAuthor}' author exists.`));
            }
            
        } catch(err) {
            await interaction.reply(errorEmbed(err));
        };
    }
};