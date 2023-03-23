const UniversalQuoteSchema = require('../../schemas/universal-quote-schema');
const { getAuthorByName } = require('../../helpers/get-author');
const { basicEmbed } = require('../../helpers/embeds');
const checkTags = require('../../helpers/check-tags');
const { SlashCommandBuilder } = require('discord.js');
const { NotFoundError } = require('../../errors')
const {
    authorDescription,
    tagDescription,
    searchPhraseDescription,
    typeDescription,
    limitDescription,
} = require('../../descriptions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('count_quotes')
		.setDescription('Count number of quotes. Use options to filter.')
        .setDMPermission(false)
        .addStringOption(option => option
            .setName('author')
            .setDescription(authorDescription)
            .setMaxLength(256)
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
        .addStringOption(option => option
            .setName('search_phrase')
            .setDescription(searchPhraseDescription)
            .setMaxLength(4096)
        )
        .addStringOption(option => option
            .setName('type')
            .setDescription(typeDescription)
            .addChoices(
                { name: 'regular quote', value: 'regular' },
                { name: 'audio quote', value: 'audio' },
                { name: 'multi-quote', value: 'multi' },
                { name: 'image quote', value: 'image' }
			)
        )
	,
	execute: async (interaction) => {
        const { options } = interaction;
        const searchPhrase = options.getString('search_phrase')
        const inputtedAuthor = options.getString('author');
        const type = options.getString('type')
        const guildId = interaction.guildId;
        const query = { guildId: guildId };
    
        if (inputtedAuthor) {
            const author = await getAuthorByName(inputtedAuthor, guildId);
            query.$or = [{ authorId: author._id }, { 'fragments.authorId': author._id }]

            if (author.name == 'Deleted Author') {
                throw new NotFoundError(inputtedAuthor)
            }
        }

        if (type) {
            if (type == 'image') {
                query.attachmentURL = { $ne: null }
            } else {
                query.type = type
                query.attachmentURL = null
            }
        }
        
        let tags = [
            options.getString('first_tag'),
            options.getString('second_tag'),
            options.getString('third_tag'),
        ];

        tags = await checkTags(tags, guildId);
        
        if (tags.length) {
            query.tags = { $all: tags };
        }

        if (searchPhrase) {
            query.$text = { $search: searchPhrase }
        }

        const count = await UniversalQuoteSchema.countDocuments(query)
        const plural = count > 1
        
        if (!count) {
            throw new NotFoundError('Quotes')
        }

        await interaction.reply(basicEmbed(`${count} quote${plural ? 's' : ''} match${plural ? '' : 'es'} your specifications!`))
    }
};