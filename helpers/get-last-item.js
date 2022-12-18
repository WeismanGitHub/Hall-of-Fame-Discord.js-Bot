const ObjectId = require('mongoose').Types.ObjectId;

async function getLastImage(channel) {
    let firstImageUrl;

    (await channel.messages.fetch({ limit: 25 }))
    .find(message => message.attachments.find(attachment => {
        if (attachment.contentType.startsWith('image')) {
            firstImageUrl = attachment.proxyURL
            return true
        }
    }))

    if (!firstImageUrl) {
        throw new Error('No image could be found in the last 25 messages.')
    }

    return firstImageUrl
}

async function getLastAudio(channel) {
    let firstAudioUrl;

    (await channel.messages.fetch({ limit: 25 }))
    .find(message => message.attachments.find(attachment => {
        const contentType = attachment.contentType

        if (contentType.startsWith('audio') || contentType.startsWith('video')) {
            firstAudioUrl = attachment.proxyURL
            return true
        }
    }))

    if (!firstAudioUrl) {
        throw new Error('No audio or video could be found in the last 25 messages.')
    }

    return firstAudioUrl
}

async function getLastQuote(channel) {
    let firstQuoteId;

    (await channel.messages.fetch({ limit: 25 }))
    .find(message => message.embeds.find(embed => {
        const _id = embed.fields[0]?.value
        
        if (ObjectId.isValid(_id)) {
            firstQuoteId = _id
            return true
        }
    }))

    if (!firstQuoteId) {
        throw new Error('No quote could be found in the last 25 messages.')
    }

    return firstQuoteId
}

module.exports = { getLastImage, getLastAudio, getLastQuote }