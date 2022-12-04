const GuildSchema = require('../schemas/guild-schema')

async function checkTags(tags, guildId) {
    const guildTags = (await GuildSchema.findOne({ _id: guildId }).select('-_id tags').lean()).tags

    tags = tags.filter(tag => {
        return (tag !== null)
    })
    
    return tags.map(tag => {
        if (!guildTags.includes(tag.toLowerCase())) {
            throw new Error(`Please make sure '${tag}' tag exists.`)
        }
        
        return tag.toLowerCase()
    })
}

module.exports = {
    checkTags,
};