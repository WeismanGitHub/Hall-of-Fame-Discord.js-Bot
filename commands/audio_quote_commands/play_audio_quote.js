const {errorEmbed, quoteEmbed, getAuthorById} = require('../../functions');
const AudioQuoteSchema = require('../../schemas/audio-quote-schema')
const {Constants} = require('discord.js');
const path = require('path')

const {
    createAudioPlayer,
    NoSubscriberBehavior,
    createAudioResource,
    joinVoiceChannel,
    AudioPlayerStatus
} = require('@discordjs/voice');

module.exports = {
    category:'Audio Quotes',
    description: 'Plays an audio quote.',
    name: 'playaudioquote',
    slash: true,

    options: [
        {
            name: 'title',
            description: 'Play quote with either an id or title.',
            type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'id',
            description: 'Play quote with either an id or title.',
            type: Constants.ApplicationCommandOptionTypes.STRING
        }
    ],

    callback: async ({interaction}) => {
        try {
            const guildId = interaction.guildId;
            const {options} = interaction;

            const id = options.getString('id');
            const title = options.getString('title');

            if (!title && !id) {
                return await interaction.reply(errorEmbed('Enter either an id or title.'))
            }

            const searchObject = { ...title && { text: title }, ...id && { _id: id } }

            const audioQuote = await AudioQuoteSchema.findOne({
                isAudioQuote: true,
                guildId: guildId,
                ...searchObject
            }).lean()

            if (!audioQuote) {
                return await interaction.reply(errorEmbed('Could not find audio quote.'))
            }

            const voiceChannel = interaction.member.voice.channel

            if (!voiceChannel) {
                return await interaction.reply(errorEmbed('You must be in a voice channel.'))
            }

            const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Stop } });
            const audioQuoteResource = createAudioResource(audioQuote.audioFileLink)
            
            
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator
            });

            player.on('error', err => {
                console.log(err)
            });

            player.play(audioQuoteResource);
            connection.subscribe(player);
            player.on(AudioPlayerStatus.Playing, () => { setTimeout(() => { player.stop() }, 30000) })
            player.on(AudioPlayerStatus.Idle, () => { connection.destroy() })

            const author = await getAuthorById(audioQuote.authorId, guildId)
            await interaction.reply(quoteEmbed(audioQuote, author))

        } catch(err) {
            console.log(err)
            await interaction.reply(errorEmbed(err));
        };
    }
};