const { MessageEmbed } = require('discord.js');

const basicEmbed = function (title, message='', color='#3826ff') {
	return {embeds: [new MessageEmbed()
	.setColor(color)
	.setTitle(title)
	.setDescription(message)]};
};

const quoteEmbed = function(quote, author, color='#8A2BE2') {
	let tags = quote.tags;
    tags = tags.filter(x => x !== null)
    tags = tags.length ? tags : ['no tags']

    if (quote.isAudioQuote) {
        color = color == '#8A2BE2' ? '#287e29' : color
        quote.text += '\n(ᴀᴜᴅɪᴏ ǫᴜᴏᴛᴇ)'
    }

	let embed = new MessageEmbed()
	.setColor(color)
	.setTitle(quote.text ?? '(No Text)')
	.setAuthor({ name: author.name, iconURL: author.imgUrl })
	.addFields({ name: 'Id:', value: `${quote._id}` })
	.addFields({ name: 'Tags:', value: tags.join(', ') })
	.setTimestamp(quote.createdAt)
    
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

module.exports = {
	basicEmbed, 
	quoteEmbed,
	errorEmbed,
	authorEmbed,
};