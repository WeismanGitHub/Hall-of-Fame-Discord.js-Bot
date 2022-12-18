const { MessageEmbed } = require('discord.js');
require('dotenv').config();

const basicEmbed = function (title, body='', color='#000EFF') {
	return { embeds: [
		new MessageEmbed()
		.setTitle(title.substring(0, 256))
		.setDescription(body.substring(0, 4096))
		.setColor(color)
	]}
};

const notificationEmbed = function(title, body, color='#FFFE00') {
	return { embeds: [new MessageEmbed()
		.setTitle(title.substring(0, 256))
		.setDescription(body.substring(0, 4096))
		.addFields({ name: 'Contact the Creator:', value: `<@${process.env.MAIN_ACCOUNT_ID}>` })
		.addFooter({ text: '`/notification_options` to unsubscribe or change the notifications channel.' })
		.setColor(color)
   ]}
}

const quoteEmbed = function(quote, author, color='#8F00FF') {
	let tags = quote.tags.filter(x => x !== null).map(tag => tag.substring(0, 85))
    tags = tags.length ? tags : ['no tags']

    if (quote.type == 'audio') {
        color = color == '#8F00FF' ? '#00A64A' : color
    } else if (quote.type == 'multi') {
		color = '#FF6388'
	}

	if (quote.attachmentURL) {
		color = '#FF7B00'
		quote.type = 'image'
	}
	
	let embed = new MessageEmbed()
	.setDescription(quote.text?.substring(0, 4096) ?? '[No Text]')
	.setAuthor({ name: author.name.substring(0, 256), iconURL: author.iconURL })
	.addFields({ name: 'Tags:', value: tags.join(', ') })
	.addFields({ name: 'ID:', value: `${quote._id}` })
	.setImage(quote.attachmentURL)
	.setTimestamp(quote.createdAt)
	.setFooter({ text: quote.type })
	.setColor(color)
	
	const embedCharacters = embed.author.name + embed.description + embed.footer.text + embed.title ?? '' + (embed.fields.map(field => field.name + field.value).join(''))

	if (embedCharacters.length > 6000) {
		throw new Error('Embed size cannot be greater than 6000.')
	}

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

const authorEmbed = function(author, color='#00EEFF') {
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
