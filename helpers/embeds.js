const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const client = require('../index')
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
const quoteEmbed = async function(quote, extraData, color='#8F00FF') { // color == purple
	let tags = quote.tags.filter(x => x !== null).map(tag => tag)
    tags = tags.length ? tags : ['no tags']
	const colorChange = (color !== '#8F00FF')

	const embed = new MessageEmbed()
	.setDescription(quote.text ?? '[No Text]')
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
		const author = extraData // Extra data is author.

		if (author.discordId) {
			author.iconURL = (await client.users.fetch(author.discordId))?.avatarURL()
		}
		
		embed.setAuthor({ name: author.name, iconURL: author.iconURL })
	}
	
	if (quote.attachmentURL) {
		quote.type = 'image'
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

	return { embeds: [embed] };
};

const errorEmbed = function(error, title='Theres been an error!', color='#FF0000', ephemeral=false) {
	error = error.toString().replace('Error: ', '');

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

const authorEmbed = async function(author, color='#00EEFF') {
	if (author.discordId) {
		author.iconURL = (await client.users.fetch(author.discordId))?.avatarURL()
	}

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
		.setLabel('In-Depth Explanation')
		.setURL("https://github.com/WeismanGitHub/Hall-of-Fame-Discord.js-Bot/blob/master/README.md")
		.setStyle('LINK'),
		new MessageButton()
		.setLabel('Source Code')
		.setURL("https://github.com/WeismanGitHub/Hall-of-Fame-Discord.js-Bot")
		.setStyle('LINK'),

	])

	const descriptionEmbed = new MessageEmbed()
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
