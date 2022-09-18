const GuildSchema = require('../schemas/guild_schema');
const mongoose = require('mongoose');

async function getAuthorByName(name, guildId) {
    try {
        return (await GuildSchema.findOne(
            {
                "guildId" : guildId, 
                authors : {$elemMatch : { name: name }
            }},
            { authors: {
                "$filter": {
                    "input": "$authors",
                    "as": "author",
                    "cond":
                    { "$eq": ["$$author.name", name] }
                }
            }
        }).lean())['authors'][0]
    } catch (err) {
        return {
            name: 'Deleted Author',
            imgUrl: 'https://cdn.discordapp.com/avatars/973042179033415690/a6602f6209ef6546ee8d878e0022a4f3.webp?size=160'
        }
    }
}

async function getAuthorById(id, guildId) {
    try {
        return (await GuildSchema.findOne(
            {
                "guildId" : guildId,
                authors : { $elemMatch: { _id: new mongoose.Types.ObjectId(id) }
            }},
            {authors: {
                "$filter": {
                    "input": "$authors",
                    "as": "author",
                    "cond":
                    { "$eq": ["$$author._id", new mongoose.Types.ObjectId(id)] }
                }
            }
        }).lean())['authors'][0]
    } catch (err) {
        return {
            name: 'Deleted Author',
            imgUrl: 'https://cdn.discordapp.com/avatars/973042179033415690/a6602f6209ef6546ee8d878e0022a4f3.webp?size=160'
        }
    }
}

module.exports = {
	getAuthorByName,
	getAuthorById,
};
