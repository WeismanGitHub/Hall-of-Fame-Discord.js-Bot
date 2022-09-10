const { basicEmbed, errorEmbed, notificationEmbed } = require('../../helpers/embeds');
const GuildSchema = require('../../schemas/guild_schema');

const {
    InteractionCollector,
    TextInputComponent,
    MessageActionRow,
    Modal,
} = require('discord.js');

module.exports = {
    category:'Notifications',
    name: 'notify',
    description: 'Notify servers.',
    //This just makes it available to my private server.
    guildOnly: true,
    testOnly: true,
    slash: true,

    callback: async ({ interaction, client }) => {
        try {
            const modal = new Modal()
			.setCustomId('notifyId')
			.setTitle('Notification');

            const titleInput = new TextInputComponent()
			.setCustomId('title')
			.setLabel('Title of the notification.')
			.setStyle('SHORT');

		    const bodyInput = new TextInputComponent()
			.setCustomId('body')
			.setLabel('Body of the notification.')
			.setStyle('PARAGRAPH');

            const firstActionRow = new MessageActionRow().addComponents(titleInput);
            const secondActionRow = new MessageActionRow().addComponents(bodyInput);

		    modal.addComponents(firstActionRow, secondActionRow);

		    await interaction.showModal(modal);

            const modalCollector = new InteractionCollector(client, { max: 1 })

            modalCollector.on('collect', async interact => {
                if (interact.isModalSubmit()) {
                    const body = interact.fields.getTextInputValue('body');
                    const title = interact.fields.getTextInputValue('title');
    
                    const guildDocs = await GuildSchema.find({ notifications: true })
                    .select('-_id guildId notificationChannelId').lean()
        
                    for (let guildDoc of guildDocs) {
                        const guild = await client.guilds.cache.get(guildDoc.guildId)
                        const notificationsChannel = await guild.channels.cache.get(guildDoc.notificationChannelId)
                        
                        //user set notification channel, guild system channel, or first channel in server
                        await (
                            notificationsChannel ?? guild.systemChannel ?? (guild.channels
                            .filter(chx => chx.type === 'text')
                            .find(x => x.position === 0))
                        ).send(notificationEmbed(title, body))
                    }

                    await interact.reply(basicEmbed('Notification sent!'))
                }
            })
        } catch(err) {
            interaction.reply(errorEmbed(err))
            .catch(_ => interaction.channel.send(errorEmbed(err)))
        }
    }
};