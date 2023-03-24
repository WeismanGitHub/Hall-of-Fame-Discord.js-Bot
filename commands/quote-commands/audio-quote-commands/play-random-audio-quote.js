const { getAuthorByName, getAuthorById } = require('../../../helpers/get-author');
const { NotFoundError, InvalidActionError } = require('../../../errors')
const AudioQuoteSchema = require('../../../schemas/audio-quote-schema')
const { quoteEmbed } = require('../../../helpers/embeds');
const checkTags = require('../../../helpers/check-tags');
const { SlashCommandBuilder } = require('discord.js');
const {
    createAudioPlayer,
    NoSubscriberBehavior,
    createAudioResource,
    joinVoiceChannel,
    AudioPlayerStatus
} = require('@discordjs/voice');
const {
    authorDescription,
    tagDescription,
    searchPhraseDescription,
} = require('../../../descriptions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play_random_quote')
		.setDescription('Play a random audio quote.')
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
	,
	execute: async (interaction) => {
        const guildId = interaction.guildId;
        const { options } = interaction;

        const searchPhrase = options.getString('search_phrase')
        const inputtedAuthor = options.getString('author');
        const query = { guildId: guildId, type: 'audio' };
        
        if (inputtedAuthor) {
            const author = await getAuthorByName(inputtedAuthor, guildId);
        
            if (author.name == 'Deleted Author') {
                throw new NotFoundError(inputtedAuthor)
            }

            query.authorId = author._id;
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
            query.$text = { '$search': searchPhrase }
        }

        const amountOfDocuments = await AudioQuoteSchema.countDocuments(query)

        if (!amountOfDocuments) {
            throw new NotFoundError('Audio Quote')
        }

        const randomNumber = Math.floor(Math.random() * amountOfDocuments);
        const randomAudioQuote = await AudioQuoteSchema.findOne(query).skip(randomNumber).lean()
        
        const voiceChannel = interaction.member.voice.channel

        if (!voiceChannel) {
            throw new InvalidActionError('Join a voice channel.')
        }

        const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Stop } });
        
        const audioQuoteResource = createAudioResource(randomAudioQuote.audioURL)
        
        const connection = joinVoiceChannel({
            selfDeaf: true,
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
                throw new InvalidActionError('Audio quote already playing.')
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
    }
};