const { ActionRowBuilder, ButtonBuilder, SlashCommandBuilder } = require('discord.js');
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
    typeDescription,
    limitDescription,
} = require('../../descriptions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('random_quotes')
		.setDescription('Get random quotes.')
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
        .addIntegerOption(option => option
            .setName('limit')
            .setDescription(limitDescription)
            .setMaxValue(9)
            .setMinValue(1)
        )
	,
	execute: async (interaction) => {
        const { options } = interaction;
        const searchPhrase = options.getString('search_phrase')
        const limit = options.getInteger('limit') == null ? 10 : options.getInteger('limit')
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

        const quotes = await UniversalQuoteSchema.aggregate([
            { $match: query },
            { $sample: { size: limit } }
        ])

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

        const filterId = (await FilterSchema.create({ query }))._id
        const customId = JSON.stringify({ type: 'random-quotes', filterId })

        const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setLabel('Next 10 Random Quotes ⏩')
            .setCustomId(`${customId}`)
            .setStyle('Primary')
        )
        
        await interaction.channel.send({
            components: [row]
        })
    }
};