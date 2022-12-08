const { errorEmbed, basicEmbed } = require('../../helpers/embeds');
const CoolDownSchema = require('../../schemas/cooldown-schema')
const QuoteSchema = require('../../schemas/quote-schema');
const sendQuotes = require('../../helpers/send-quotes')
const moment = require('moment');

const {
    Constants,
    MessageActionRow,
    MessageButton,
} = require('discord.js');

module.exports = {
    category:'Quotes',
    name: 'get_all_quotes',
    description: 'Get all quotes.',
    guildOnly: true,
    slash: true,

    options: [
        {
            name: 'date',
            description: 'Sort by newest/oldest.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
            choices: [
                {
                    name: 'newest',
                    value: '-1'
                },
                {
                    name: 'oldest',
                    value: '1'
                },
            ]
        },
        {
            name: 'pagination',
            description: 'Send all quotes at once or ten at a time.',
            type: Constants.ApplicationCommandOptionTypes.BOOLEAN,
        },
    ],

    callback: (async ({ interaction }) => {
        try {
            const guildId = interaction.guildId;
            const { options } = interaction;
            const createdAtSort = options.getString('date') == '1' ? 1 : -1
            const pagination = options.getBoolean('pagination')

            if (pagination == false) {
                const cooldown = await CoolDownSchema.findOne({ _id: interaction.user.id, command: 'pagination' }).lean()

                if (cooldown?.command == 'pagination') {
                    const timeFromNow = moment(cooldown.expirationDate).fromNow() 
                    throw new Error(`You can only turn off pagination every twelve hours. Try again ${timeFromNow}.`)
                }
            }

            const quotes = await QuoteSchema.find({ guildId: guildId }).sort({ createdAt: createdAtSort })
            .limit(pagination == false ? Infinity : 10).lean();

            if (!quotes.length) {
                throw new Error('This server has no quotes.')
            }

            await interaction.reply(basicEmbed('Started!'))

            // sendQuotes modifies quotes array so gotta use a copy.
            await sendQuotes([...quotes], interaction.channel)
            
            if (quotes.length < 10) {
                // Putting the message and return on the same line doesn't actually cause it to return. Maybe because it's a promise? Idk.
                await interaction.channel.send(basicEmbed('Done!'))
                return
            }

            if (pagination !== false) {
                const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setLabel('Next 10 Quotes ⏩')
                    .setCustomId(`10,${createdAtSort},all_quotes`)
                    .setStyle('PRIMARY')
                    )
    
                await interaction.channel.send({
                    components: [row]
                })
            } else {
                console.log(await CoolDownSchema.create({ _id: interaction.user.id, command: 'pagination' }))
                await interaction.channel.send(basicEmbed('Done!'))
            }
        } catch(err) {
            interaction.reply(errorEmbed(err))
            .catch(_ => interaction.channel.send(errorEmbed(err)))
        }
    })
};