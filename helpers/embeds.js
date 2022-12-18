const { MessageEmbed } = require('discord.js');
require('dotenv').config();

const basicEmbed = function (title, body='', color='#3826ff') {
	return { embeds: [new MessageEmbed()
		.setTitle(title.substring(0, 256))
		.setDescription(body.substring(0, 4096))] }
		.setColor(color)
};

const notificationEmbed = function(title, body, color='#ffff00') {
	return { embeds: [new MessageEmbed()
		.setTitle(title.substring(0, 256))
		.setDescription(body.substring(0, 4015) + '\n\n`/notification_options` to unsubscribe or change the notifications channel.')
		.addFields({ name: 'Contact the Creator:', value: `<@${process.env.MAIN_ACCOUNT_ID}>` })
		.setColor(color)
   ]}
}

const quoteEmbed = function(quote, author, color='#8A2BE2') {
	let tags = quote.tags.filter(x => x !== null).map(tag => tag.substring(0, 85))
    tags = tags.length ? tags : ['no tags']

    if (quote.type == 'audio quote') {
        color = color == '#8A2BE2' ? '#287e29' : color
    } else if (quote.type == 'multi-quote') {
		color = 'd3657f'
	}

	if (quote.attachmentURL) {
		color = '#ff9915'
	}
	
	let embed = new MessageEmbed()
	.setTitle(quote.text.substring(0, 256) ?? '[No Text]')
	.setAuthor({ name: author.name.substring(0, 256), iconURL: author.iconURL })
	.addFields({ name: 'ID:', value: `${quote._id}` })
	.addFields({ name: 'Tags:', value: tags.join(', ') })
	.setImage(quote.attachmentURL)
	.setTimestamp(quote.createdAt)
	.setFooter({ text: quote.type })
	.setColor(color)

	return { embeds: [embed] };
};

const errorEmbed = function(error, title='Theres been an error!', color='#FF0000', ephemeral=false) {
	error = error.toString();
	
	return {
        embeds: [
			new MessageEmbed()
			.setTitle(title.substring(0, 256))
			.setDescription(error.substring(0, 4096))
			.setColor(color)
		],
		ephemeral: ephemeral
    };
};

const authorEmbed = function(author, color='#5865F2') {
	return {
        embeds: [new MessageEmbed()
		.setColor(color)
		.setAuthor({ name: author.name.substring(0, 256), iconURL: author.iconURL })
	]}
}

module.exports = {
	notificationEmbed,
	authorEmbed,
	quoteEmbed,
	errorEmbed,
	basicEmbed,
};
