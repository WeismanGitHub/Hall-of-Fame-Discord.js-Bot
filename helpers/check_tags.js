async function checkTags(tags, guildId) {
    const guildTags = (await GuildSchema.findOne({ guildId: guildId }).select('-_id tags').lean()).tags;

    tags = tags.filter(tag => {
        return (tag !== null)
    })

    return tags.map(tag => {
        if (!guildTags.includes(tag)) {
            throw new Error(`Please make sure '${tag}' tag exists.`)
        }
    })
}

module.exports = {
    checkTags,
};