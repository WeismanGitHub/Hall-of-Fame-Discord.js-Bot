const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { InvalidInputError } = require('../errors');
require('dotenv').config();

const basicEmbed = function (title, body='', color='#000EFF') {
	return { embeds: [
		new MessageEmbed()
		.setTitle(title.substring(0, 256))
		.setDescription(body.substring(0, 4096))
		.setColor(color) // blue
	]}
};

const notificationEmbed = function(title, body, color='#FFFE00') {
	return { embeds: [new MessageEmbed()
		.setTitle(title.substring(0, 256))
		.setDescription(body.substring(0, 4096))
		.addFields({ name: 'Contact the Creator:', value: `<@${process.env.MAIN_ACCOUNT_ID}>` })
		.addFooter({ text: '`/notification_options` to unsubscribe or change the notifications channel.' })
		.setColor(color) // yellow
   ]}
}

// Multi-quote isn't separate embed because easier to determine what to do here than anywhere there could be a multi-quote.
const quoteEmbed = function(quote, extraData, color='#8F00FF') { // color == purple
	let tags = quote.tags.filter(x => x !== null).map(tag => tag.substring(0, 85))
    tags = tags.length ? tags : ['no tags']
	let embedCharacters = ''
	const colorChange = (color !== '#8F00FF')
	
	if (quote.attachmentURL) {
		quote.type = 'image'
	}

	const embed = new MessageEmbed()
	.setDescription(quote.text?.substring(0, 4096) ?? '[No Text]')
	.addFields({ name: 'Tags:', value: tags.join(', ') })
	.addFields({ name: 'ID:', value: `${quote._id}` })
	.setImage(quote.attachmentURL)
	.setTimestamp(quote.createdAt)
	.setFooter({ text: quote.type })
	
	if (quote.type == 'multi') {
		const formattedFragments = extraData.map(fragment => { // Extra data is fragments.
			return `${fragment.authorName}: ${fragment.text}`
		}).join('\n')

		embed.setTitle(quote.text)
		embed.setDescription(formattedFragments)
	} else {
		embed.setAuthor({ name: extraData.name.substring(0, 256), iconURL: extraData.iconURL }) // Extra data is author.
		embedCharacters += embed.author.name
	}

	if (!colorChange) {
		switch (quote.type) {
			case 'multi':
				color = '#ff2e95' // pink
				break;

				case 'audio':
				color = '#00A64A'// green
				break;

				case 'image':
				color = '#FF7B00'// orange
				break;
		}
	}

	embed.setColor(color)
	
	embedCharacters += (
		embed.description
		+ embed.footer.text
		+ embed.title ?? ''
		+ (embed.fields.map(field => field.name + field.value).join(''))
	)

	if (embedCharacters.length > 6000) {
		throw new InvalidInputError('Embed size cannot be greater than 6000.')
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
			.setColor(color) // red
		],
		ephemeral: ephemeral
    };
};

const authorEmbed = function(author, color='#00EEFF') {
	return {
        embeds: [new MessageEmbed()
		.setColor(color) // cyan
		.setAuthor({ name: author.name.substring(0, 256), iconURL: author.iconURL })
	]}
}

const helpEmbed = function() {
	const customId = JSON.stringify({ type: 'help' })

	const row = new MessageActionRow()
	.addComponents([
		new MessageButton()
		.setLabel('Command Descriptions')
		.setCustomId(`${customId}`)
		.setStyle('PRIMARY'),
		new MessageButton()
		.setLabel('Source Code')
		.setURL("https://github.com/WeismanGitHub/Hall-of-Fame-Discord.js-Bot")
		.setStyle('LINK'),
		new MessageButton()
		.setLabel('In-Depth Explanation')
		.setURL("https://github.com/WeismanGitHub/Hall-of-Fame-Discord.js-Bot/blob/master/README.md")
		.setStyle('LINK')
	])

	const descriptionEmbed = new MessageEmbed()
	.setColor('#5865F2') // Discord Blurple
	.setDescription('A hall of fame bot with 28 commands that allow you save text, images, and audio. The purpose is to allow users to organize memorable moments so they can be easily accessed and found with authors, tags, types, dates, and more. To create quotes you must first create an author for the quote. An author has a name and optionally an image. You can also add tags to quotes, which need to be created beforehand. Every type of quote (audio, image, regular, and multi) has an author, text, and up to three tags. I strongly recommend you check the Github readme for a more in depth explanation.')
	.addFields({ name: 'Contact the Creator:', value: `<@${process.env.MAIN_ACCOUNT_ID}>` })

	return { embeds: [descriptionEmbed], components: [row] }
}

module.exports = {
	notificationEmbed,
	authorEmbed,
	quoteEmbed,
	errorEmbed,
	basicEmbed,
	helpEmbed
};
