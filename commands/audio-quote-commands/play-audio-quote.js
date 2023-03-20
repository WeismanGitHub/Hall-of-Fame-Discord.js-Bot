const { InvalidInputError, NotFoundError, InvalidActionError } = require('../../errors')
const AudioQuoteSchema = require('../../schemas/audio-quote-schema')
const { getLastQuoteId } = require('../../helpers/get-last-item')
const { getAuthorById } = require('../../helpers/get-author');
const errorHandler = require('../../helpers/error-handler');
const { quoteEmbed } = require('../../helpers/embeds');

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
          // type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 4096
        },
        {
            name: 'id',
            description: 'Play quote with either an id or title.',
       //     type: Constants.ApplicationCommandOptionTypes.STRING,
            minLength: 24,
            maxLength: 24,
        },
        {
            name: 'last_quote',
            description: "Use the last quote sent in a channel. Will grab any type of quote.",
         //   type: Constants.ApplicationCommandOptionTypes.CHANNEL
        },
    ],

    callback: async ({ interaction }) => errorHandler(interaction, async () => {
        const guildId = interaction.guildId;
        const { options } = interaction;
        
        const lastQuoteChannel = options.getChannel('last_quote');
        const title = options.getString('title');
        let id = options.getString('id')

        if (!id && !title) {
            await getLastQuoteId(lastQuoteChannel)
        }
        
        if (!title && !id) {
            throw new InvalidInputError('ID/Title')
        }
    
        const search = { ...title && { text: title }, ...id && { _id: id } }
        const voiceChannel = interaction.member.voice.channel
        
        if (!voiceChannel) {
            throw new InvalidActionError('Join a voice channel.')
        }
        
        const audioQuote = await AudioQuoteSchema.findOne({
            guildId: guildId,
            type: 'audio',
            ...search
        }).lean()

        if (!audioQuote) {
            throw new NotFoundError('Audio Quote')
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

        const author = await getAuthorById(audioQuote.authorId, guildId)
        await interaction.reply(quoteEmbed(audioQuote, author))
    })
};