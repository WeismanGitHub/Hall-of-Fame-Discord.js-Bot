const GuildSchema = require('../schemas/guild_schema');
const mongoose = require('mongoose');

async function getAuthorByName(name, guildId) {
    try {
        const author = (await GuildSchema.findOne(
            { guildId : guildId },
            { authors: {
                "$filter": {
                    "input": "$authors",
                    "as": "author",
                    "cond":
                    { "$eq": ["$$author.name", name] }
                }
            }
        }).lean())['authors'][0]

        if (!author) {
            throw new Error('No author.')
        }

        return author
    } catch (err) {
        return {
            name: 'Deleted Author',
            imgUrl: 'https://cdn.discordapp.com/avatars/973042179033415690/a6602f6209ef6546ee8d878e0022a4f3.webp?size=160'
        }
    }
}

async function getAuthorById(id, guildId) {
    try {
        const author = (await GuildSchema.findOne(
            { guildId : guildId },
            { authors: {
                "$filter": {
                    "input": "$authors",
                    "as": "author",
                    "cond":
                    { "$eq": ["$$author._id", new mongoose.Types.ObjectId(id)] }
                }
            }
        }).lean())['authors'][0]

        if (!author) {
            throw new Error('No author.')
        }

        return author
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
