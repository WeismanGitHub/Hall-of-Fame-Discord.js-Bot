const AudioQuoteSchema = require('../../schemas/audio-quote-schema')
const { getLastQuoteId } = require('../../helpers/get-last-item')
const { getAuthorById } = require('../../helpers/get-author');
const errorHandler = require('../../helpers/error-handler');
const { quoteEmbed } = require('../../helpers/embeds');
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
            type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 4096
        },
        {
            name: 'id',
            description: 'Play quote with either an id or title.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
            minLength: 24,
            maxLength: 24,
        },
        {
            name: 'last_quote',
            description: "Use the last quote sent in a channel. Will grab any type of quote.",
            type: Constants.ApplicationCommandOptionTypes.CHANNEL
        },
    ],

    callback: async ({ interaction }) => errorHandler(interaction, async () => {
        const lastQuoteChannel = options.getChannel('last_quote');
        const guildId = interaction.guildId;
        const { options } = interaction;

        const id = options.getString('id') ?? await getLastQuoteId(lastQuoteChannel)
        const title = options.getString('title');

        if (!title && !id) {
            throw new Error('Enter a quote id or choose a channel to get the quote id from.')
        }
    
        const search = { ...title && { text: title }, ...id && { _id: id } }
        const voiceChannel = interaction.member.voice.channel
        
        if (!voiceChannel) {
            throw new Error('You must be in a voice channel.')
        }
        
        const audioQuote = await AudioQuoteSchema.findOne({
            guildId: guildId,
            type: 'audio',
            ...search
        }).lean()

        if (!audioQuote) {
            throw new Error('Could not find audio quote.')
        }

        const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Stop } });
        
        const audioQuoteResource = createAudioResource(audioQuote.audioURL)
        
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

        const author = await getAuthorById(audioQuote.authorId, guildId)
        await interaction.reply(quoteEmbed(audioQuote, author))
    })
};