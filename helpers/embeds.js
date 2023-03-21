const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
require('dotenv').config();

const basicEmbed = function (title, body='', color='#000EFF') {
	const embed = new EmbedBuilder()
	.setTitle(title.substring(0, 256))
	.setColor(color) // blue

	if (body.length ) {
		embed.setDescription(body.substring(1, 4096))
	}
	
	return { embeds: [embed] }
};

const notificationEmbed = function(title, body, color='#FFFE00') {
	return { embeds: [new EmbedBuilder()
		.setTitle(title.substring(0, 256))
		.setDescription(body.substring(0, 4096))
		.addFields({ name: 'Contact the Creator:', value: `<@${process.env.MAIN_ACCOUNT_ID}>` })
		.addFooter({ text: '`/notification_options` to unsubscribe or change the notifications channel.' })
		.setColor(color) // yellow
   ]}
}

// Multi-quote isn't separate embed because easier to determine what to do here than anywhere there could be a multi-quote.
const quoteEmbed = function(quote, extraData, color='#8F00FF') { // color == purple
	let tags = quote.tags.filter(x => x !== null).map(tag => tag)
    tags = tags.length ? tags : ['no tags']
	const colorChange = (color !== '#8F00FF')

	const embed = new EmbedBuilder()
	.setDescription(quote.text || '[No Text]')
	.addFields({ name: 'Tags:', value: tags.join(', ') })
	.addFields({ name: 'ID:', value: `${quote._id}` })
	.setImage(quote.attachmentURL)
	.setTimestamp(quote.createdAt)
	.setFooter({ text: quote.attachmentURL ? 'image' : quote.type })
	
	if (quote.type == 'multi') {
		const formattedFragments = extraData.map(fragment => { // Extra data is fragments.
			return `${fragment.authorName}: ${fragment.text}`
		}).join('\n')

		embed.setTitle(quote.text)
		embed.setDescription(formattedFragments)
	} else {
		const author = extraData // Extra data is author.
		
		embed.setAuthor({ name: author.name, iconURL: author.iconURL || process.env.DEFAULT_ICON_URL })
	}

	if (!colorChange) {
		switch (quote.type) {
			case 'multi':
				color = '#ff2e95' // pink
				break;

				case 'audio':
				color = '#00A64A'// green
				break;
		}
	}

	if (quote.attachmentURL) {
		color = '#FF7B00'// orange
	}
	
	embed.setColor(color)

	return { embeds: [embed] };
};

const errorEmbed = function(error, title='Theres been an error!', color='#FF0000', ephemeral=false) {
	error = error.toString().replace('Error: ', '');

	return {
        embeds: [
			new EmbedBuilder()
			.setTitle(title.substring(0, 256))
			.setDescription(error.substring(0, 4096))
			.setColor(color) // red
		],
		ephemeral: ephemeral
    };
};

const authorEmbed = function(author, color='#00EEFF') {
	const { iconURL, name } = author

	return {
        embeds: [new EmbedBuilder()
		.setColor(color) // cyan
		.setAuthor({ name: name.substring(0, 256), iconURL: (iconURL || process.env.DEFAULT_ICON_URL) })
	]}
}

const helpEmbed = function() {
	const customId = JSON.stringify({ type: 'help' })

	const row = new ActionRowBuilder()
	.addComponents([
		new ButtonBuilder()
		.setLabel('Command Descriptions')
		.setCustomId(`${customId}`)
		.setStyle('Primary'),
		new ButtonBuilder()
		.setLabel('Web Dashboard')
		.setURL("https://hall-of-fame-discordjs-bot.weisman.repl.co/")
		.setStyle('Link'),
		new ButtonBuilder()
		.setLabel('In-Depth Explanation')
		.setURL("https://github.com/WeismanGitHub/Hall-of-Fame-Discord.js-Bot/blob/master/README.md")
		.setStyle('Link'),
		new ButtonBuilder()
		.setLabel('Source Code')
		.setURL("https://github.com/WeismanGitHub/Hall-of-Fame-Discord.js-Bot")
		.setStyle('Link'),
		new ButtonBuilder()
		.setLabel('Buy Me a Coffee')
		.setURL(process.env.COFFEE_LINK)
		.setStyle('Link'),

	])

	const descriptionEmbed = new EmbedBuilder()
	.setColor('#5865F2') // Discord Blurple
	.setDescription("A hall of fame bot with 28 commands that allow you save text, images, and audio. This bot's purpose is to allow users to organize memorable moments so they can be easily classified and accessed with authors, tags, types, text, and more. Use the web dashboard as an easier alternative. Authors and tags must be defined before creating a quote. I strongly recommend you check the Github readme for a more in depth explanation.")
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
