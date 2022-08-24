const { MessageEmbed } = require('discord.js');
const GuildSchema = require('./schemas/guild_schema');
const mongoose = require('mongoose');

const basicEmbed = function (title, message='', color='#5865F2') {
	return {embeds: [new MessageEmbed()
	.setColor(color)
	.setTitle(title)
	.setDescription(message)]};
};

const quoteEmbed = function(quote, author, color='#5865F2') {
	let tags = quote.tags;
    tags = tags.filter(x => x !== null)
    tags = tags.length ? tags : ['no tags']

	let embed = new MessageEmbed()
	.setColor(color)
	.setTitle(quote.text ?? '(No Text)')
	.setAuthor({ name: author.name, iconURL: author.imgUrl })
	.addFields({ name: 'Id:', value: `${quote._id}` })
	.addFields({ name: 'Tags:', value: tags.join(', ') })
	.setTimestamp(quote.createdAt)
    .addFields({ name: 'Audio Quote:', value: String(Boolean(quote.isAudioQuote)) })

	if (quote.attachment !== null) {
		embed.setImage(quote.attachment);
	};
	
	return { embeds: [embed] };
};

const errorEmbed = function(error, title='Theres been an error!', color='#FF0000') {
	error = error.toString();
	
	return {
        embeds: [new MessageEmbed()
        .setColor(color)
        .setTitle(title)
        .setDescription(error)]
    };
};

const authorEmbed = function(author, color='#5865F2') {
	return {
        embeds: [new MessageEmbed()
		.setColor(color)
		.setAuthor({ name: author.name, iconURL: author.imgUrl })
	]}
}

async function getAuthorByName(name, guildId) {
    try {
        return (await GuildSchema.findOne(
            {
                "guildId" : guildId, 
                authors : {$elemMatch : {name: name}
            }},
            {authors: {
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

async function checkTags(uncheckedTags, guildTags) {
    uncheckedTags = uncheckedTags.map(tag => {
        return typeof(tag) == 'string' ? tag.toLowerCase() : tag
    })
    
    let checkedTagsObject = {
        tagsExist: true,
        checkedTags: []
    };
    
    for (let uncheckedTag of uncheckedTags) {
        if (guildTags.includes(uncheckedTag)) {
            checkedTagsObject.checkedTags.push(uncheckedTag);
        } else if (uncheckedTag !== null) {
            checkedTagsObject.tagsExist = false
        }
    }

    return checkedTagsObject;
}

module.exports = {
	basicEmbed, 
	quoteEmbed,
	errorEmbed,
	authorEmbed,
	getAuthorByName,
	getAuthorById,
    checkTags,
};
