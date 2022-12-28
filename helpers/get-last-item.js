const { InvalidInputError, NotFoundError } = require('../errors');
const ObjectId = require('mongoose').Types.ObjectId;

async function getLastImage(channel) {
    let firstImageUrl;

    if (channel.type !== 'GUILD_TEXT') {
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

    if (channel.type !== 'GUILD_TEXT') {
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

async function getLastQuoteId(channel) {
    let firstQuoteId;

    if (channel.type !== 'GUILD_TEXT') {
        throw new InvalidInputError('Channel')
    }
    
    (await channel.messages.fetch({ limit: 50 }))
    .find(message => message.embeds.find(embed => {
        const _id = embed.fields[1]?.value
        
        if (ObjectId.isValid(_id)) {
            firstQuoteId = _id
            return true
        }
    }))

    if (!firstQuoteId) {
        throw new NotFoundError('Quote')
    }

    return firstQuoteId
}

module.exports = { getLastImage, getLastAudio, getLastQuoteId }