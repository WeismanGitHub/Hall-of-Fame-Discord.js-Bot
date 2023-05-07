const { InvalidInputError, NotFoundError, InvalidActionError } = require('../../../errors')
const AudioQuoteSchema = require('../../../schemas/audio-quote-schema')
const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { getAuthorById } = require('../../../helpers/get-author');
const { quoteEmbed } = require('../../../helpers/embeds');
const {
    createAudioPlayer,
    NoSubscriberBehavior,
    createAudioResource,
    joinVoiceChannel,
    AudioPlayerStatus
} = require('@discordjs/voice');
const {
    idDescription,
    titleDescription,
    lastAudioDescription,
} = require('../../../descriptions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play_quote')
		.setDescription('Play an audio quote.')
        .setDMPermission(false)
        .addStringOption(option => option
            .setName('title')
            .setDescription(titleDescription)
            .setMaxLength(4096)
        )
        .addStringOption(option => option
            .setName('id')
            .setDescription(idDescription)
            .setMaxLength(24)
            .setMinLength(24)
        )
        .addChannelOption(option => option
            .setName('last_audio')
            .setDescription(lastAudioDescription)
            .addChannelTypes(ChannelType.GuildText)
        )
	,
	execute: async (interaction) => {
        
        const guildId = interaction.guildId;
        const { options } = interaction;
        
        const title = options.getString('title');
        let id = options.getString('id')
        
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
    }
};