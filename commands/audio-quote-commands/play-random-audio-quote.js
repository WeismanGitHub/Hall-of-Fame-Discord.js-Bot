const { getAuthorByName, getAuthorById } = require('../../helpers/get-author');
const AudioQuoteSchema = require('../../schemas/audio-quote-schema')
const errorHandler = require('../../helpers/error-handler');
const { quoteEmbed } = require('../../helpers/embeds');
const checkTags = require('../../helpers/check-tags');
const { Constants } = require('discord.js');

const {
    createAudioPlayer,
    NoSubscriberBehavior,
    createAudioResource,
    joinVoiceChannel,
    AudioPlayerStatus
} = require('@discordjs/voice');

module.exports = {
    category:'Audio Quotes',
    name: 'play_random_quote',
    description: 'Play a random audio quote.',
    guildOnly: true,
    slash: true,

    options: [
        {
            name: 'author',
            description: 'Sort by author of quote.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 256
        },
        {
            name: 'first_tag',
            description: 'Quote must include this tag.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 339
        },
        {
            name: 'second_tag',
            description: 'Quote must include this tag.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 339
        },
        {
            name: 'third_tag',
            description: 'Quote must include this tag.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 339
        },
        {
            name: 'search_phrase',
            description: 'A phrase to search for in the quote text.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 4096
        },
    ],

    callback: async ({ interaction }) => errorHandler(interaction, async () => {
        const guildId = interaction.guildId;
        const { options } = interaction;

        const searchPhrase = options.getString('search_phrase')
        let inputtedAuthor = options.getString('author');
        const query = { guildId: guildId, type: 'audio' };
        
        if (inputtedAuthor) {
            inputtedAuthor = await getAuthorByName(inputtedAuthor, guildId);
        
            if (inputtedAuthor.name !== 'Deleted Author') {
                query.authorId = inputtedAuthor._id;
            } else {
                throw new Error(`'${inputtedAuthor}' author does not exist.`)
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
            query.$text = {
                '$search': searchPhrase
            }
        }

        const amountOfDocuments = await AudioQuoteSchema.countDocuments(query)

        if (!amountOfDocuments) {
            throw new Error('Your specifications provide no quotes.')
        }

        const randomNumber = Math.floor(Math.random() * amountOfDocuments);
        const randomAudioQuote = await AudioQuoteSchema.findOne(query).skip(randomNumber).lean()
        
        const voiceChannel = interaction.member.voice.channel

        if (!voiceChannel) {
            throw new Error('You must be in a voice channel.')
        }

        const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Stop } });
        
        const audioQuoteResource = createAudioResource(randomAudioQuote.audioURL)
        
        const connection = joinVoiceChannel({
            selfDeaf: false,
            channelId: voiceChannel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator
        });

        player.on('error', err => {
            console.log(err)
        });

        // Originally I wanted it to just queue the next audio quote, but I couldn't figure it out. I've opted to have it just check if the bot is already playing an audio quote and tell the user you have to wait till the audio quote is done playing.
        interaction.member.voice.channel.members.forEach(member => {
            if (member.id == process.env.CLIENT_ID) {
                throw new Error('You must wait for the current audio quote to stop playing.')
            }
        })

        player.play(audioQuoteResource)
        connection.subscribe(player)
        
        player.on(AudioPlayerStatus.Playing, () => {
            setTimeout(() => { player.stop() }, 30000);
        })

        player.on(AudioPlayerStatus.Idle, () => {
            return connection.destroy()
        })

        const author = await getAuthorById(randomAudioQuote.authorId, guildId);
        await interaction.reply(quoteEmbed(randomAudioQuote, author))
    })
};