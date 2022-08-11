const {errorEmbed, checkTags, audioQuoteEmbed} = require('../../functions');
const {Constants} = require('discord.js');

module.exports = {
    category:'Audio Quotes',
    description: 'Creates an audio quote tied to your server.',
    name: 'createAudioQuote',
    slash: true,

    options: [
        {
            name: 'author',
            description: 'The name of who said the quote. You must first register an author with /createauthor.',
            required: true,
            type: Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'audio file link',
            description: 'Must be a link to an audio file. You can upload the audio file to discord and copy that link.',
            required: true,
            type: Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'title',
            description: 'Title of the audio quote.',
            required: true,
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
            const guildId = interaction.guildId;
            const {options} = interaction;

            const inputtedAuthor = options.getString('author');
            const checkedAuthor = await getAuthorByName(inputtedAuthor, guildId);

            if (checkedAuthor.name !== 'Deleted Author') {
                const title = options.getString('title');
                const audioFileLink = options.getString('audio file link');

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

                const audioQuote = await QuoteSchema.create({
                    guildId: guildId,
                    authorId: checkedAuthor._id,
                    tags: checkedTags,
                    attachment: attachmentLink,
                    audioQuote: true
                });
                
                await interaction.reply(audioQuoteEmbed(audioQuote))
            } else {
                await interaction.reply(errorEmbed(`Make sure that '${inputtedAuthor}' author exists.`));
            }
        } catch(err) {
            await interaction.reply(errorEmbed(err));
        };
    }
};