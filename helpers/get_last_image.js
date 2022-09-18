async function getLastImage(channel) {
    let firstImageUrl;

    (await channel.messages.fetch({ limit: 25 }))
    .find(message => message.attachments.find(attachment => {
        firstImageUrl = attachment.proxyURL
        return Boolean(attachment)
    }))

    if (!firstImageUrl) {
        throw new Error('No attachment could be found in the last 25 messages.')
    }

    return firstImageUrl
}

module.exports = getLastImage