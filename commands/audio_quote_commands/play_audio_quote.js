const AudioQuoteSchema = require('../../schemas/audio_quote_schema')
const { errorEmbed, quoteEmbed } = require('../../helpers/embeds');
const { getAuthorById } = require('../../helpers/get_author');
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
    name: 'play_quote',
    description: 'Play an audio quote.',
    guildOnly: true,
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

    callback: async ({ interaction }) => {
        try {
            const guildId = interaction.guildId;
            const { options } = interaction;

            const id = options.getString('id');
            const title = options.getString('title');

            if (!title && !id) {
                throw new Error('Enter either an id or title.')
            }
        
            const searchObject = { ...title && { text: title }, ...id && { _id: id } }

            const audioQuote = await AudioQuoteSchema.findOne({
                isAudioQuote: true,
                guildId: guildId,
                ...searchObject
            }).lean()

            if (!audioQuote) {
                throw new Error('Could not find audio quote.')
            }

            const voiceChannel = interaction.member.voice.channel

            if (!voiceChannel) {
                throw new Error('You must be in a voice channel.')
            }

            const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Stop } });
            
            const audioQuoteResource = createAudioResource(audioQuote.audioFileLink)
            
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
                if (member.id == '973042179033415690') {
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

            const author = await getAuthorById(audioQuote.authorId, guildId)
            await interaction.reply(quoteEmbed(audioQuote, author))
        } catch(err) {
            interaction.reply(errorEmbed(err))
            .catch(_ => interaction.channel.send(errorEmbed(err)))
        }
    }
};