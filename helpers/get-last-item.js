const { InvalidInputError, NotFoundError } = require('../errors');
const ObjectId = require('mongoose').Types.ObjectId;
const { ChannelType } = require('discord.js')

async function getLastImage(channel) {
    let firstImageUrl;

    if (channel.type !== ChannelType.GuildText) {
        throw new InvalidInputError('Channel')
    }

    (await channel.messages.fetch({ limit: 50 }))
    .find(message => message.attachments.find(attachment => {
        if (attachment.contentType.startsWith('image')) {
            firstImageUrl = attachment.proxyURL
            return true
        }
    }))

    if (!firstImageUrl) {
        throw new NotFoundError('Image')
    }

    return firstImageUrl
}

async function getLastAudio(channel) {
    let firstAudioUrl;

    if (channel.type !== ChannelType.GuildText) {
        throw new InvalidInputError('Channel')
    }

    (await channel.messages.fetch({ limit: 50 }))
    .find(message => message.attachments.find(attachment => {
        const contentType = attachment.contentType

        if (contentType.startsWith('audio') || contentType.startsWith('video')) {
            firstAudioUrl = attachment.proxyURL
            return true
        }
    }))

    if (!firstAudioUrl) {
        throw new NotFoundError('Audio/Video')
    }

    return firstAudioUrl
}

module.exports = { getLastImage, getLastAudio }