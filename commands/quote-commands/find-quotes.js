const { MessageActionRow, MessageButton, SlashCommandBuilder } = require('discord.js');
const UniversalQuoteSchema = require('../../schemas/universal-quote-schema');
const { getAuthorByName } = require('../../helpers/get-author');
const FilterSchema = require('../../schemas/filter-schema');
const sendQuotes = require('../../helpers/send-quotes');
const { basicEmbed } = require('../../helpers/embeds');
const checkTags = require('../../helpers/check-tags');
const { NotFoundError } = require('../../errors');
const {
    authorDescription,
    tagDescription,
    searchPhraseDescription,
    ageDescription,
    typeDescription,
    limitDescription,
    paginationDescription
} = require('../../descriptions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('find_quotes')
		.setDescription('Get quotes that match your specifications.')
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
            .setName('age')
            .setDescription(ageDescription)
            .addChoices(
				{ name: 'newest', value: '-1' },
				{ name: 'oldest', value: '1' },
			)
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
        .addIntegerOption(option => option
            .setName('limit')
            .setDescription(limitDescription)
            .setMaxValue(9)
            .setMinValue(1)
        )
        .addBooleanOption(option => option
            .setName('pagination')
            .setDescription(paginationDescription)
        )
	,
	execute: async (interaction) => {
        const { options } = interaction;
        const sort = options.getString('age') == null ? { createdAt: -1 } : { createdAt: options.getString('age') }
        const limit = options.getInteger('limit') == null ? 10 : options.getInteger('limit')
        const searchPhrase = options.getString('search_phrase')
        const pagination = options.getBoolean('pagination')
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

        const quotes = await UniversalQuoteSchema.find(query).sort(sort)
        .limit(pagination == false ? Infinity : limit).lean();

        if (!quotes.length) {
            throw new NotFoundError('Quotes')
        }

        await interaction.reply(basicEmbed('Started!'))

        // sendQuotes modifies quotes array so gotta use a copy.
        await sendQuotes([...quotes], interaction.channel)

        if (quotes.length < 10) {
            // Putting the message and return on the same line doesn't actually cause it to return. IDFK why.
            await interaction.channel.send(basicEmbed('Done!'))
            return
        }

        if (pagination == false) {
            return await interaction.channel.send(basicEmbed('Done!'))
        }

        const filterId = (await FilterSchema.create({ query: query, sort: sort }))._id
        const customId = JSON.stringify({ type: 'find-quotes', filterId: filterId, skipAmount: 10 })

        const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setLabel('Next 10 Quotes ⏩')
            .setCustomId(`${customId}`)
            .setStyle('PRIMARY')
        )
        
        await interaction.channel.send({
            components: [row]
        })
    }
};