const GuildSchema = require('../schemas/guild-schema');
const { InvalidInputError, NotFoundError } = require('../errors');
const mongoose = require('mongoose');

async function getAuthorByName(name, guildId) {
    if (!guildId || !name) {
        throw new InvalidInputError('Name/Guild ID')
    }

    try {
        const author = (await GuildSchema.findOne(
            { _id : guildId },
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
            throw new NotFoundError(author)
        }

        return author
    } catch (err) {
        return {
            name: 'Deleted Author',
            iconURL: 'https://cdn.discordapp.com/avatars/973042179033415690/a6602f6209ef6546ee8d878e0022a4f3.webp?size=160'
        }
    }
}

async function getAuthorById(id, guildId) {
    if (!guildId || !id) {
        throw new InvalidInputError('ID/Guild ID')
    }
    
    try {
        const author = (await GuildSchema.findOne(
            { _id : guildId },
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
            throw new NotFoundError(author)
        }

        return author
    } catch (err) {
        return {
            name: 'Deleted Author',
            iconURL: 'https://cdn.discordapp.com/avatars/973042179033415690/a6602f6209ef6546ee8d878e0022a4f3.webp?size=160'
        }
    }
}

module.exports = {
	getAuthorByName,
	getAuthorById,
};
