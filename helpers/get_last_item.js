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
        if (contentType.startsWith('audio' || contentType.startsWith('video'))) {
            firstAudioUrl = attachment.proxyURL
            return true
        }
    }))

    if (!firstAudioUrl) {
        throw new Error('No audio or video could be found in the last 25 messages.')
    }

    return firstAudioUrl
}

module.exports = { getLastImage, getLastAudio }