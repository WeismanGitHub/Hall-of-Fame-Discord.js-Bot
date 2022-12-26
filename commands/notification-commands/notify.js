const { basicEmbed, notificationEmbed } = require('../../helpers/embeds');
const errorHandler = require('../../helpers/error-handler');
const GuildSchema = require('../../schemas/guild-schema');
const {
    InteractionCollector,
    TextInputComponent,
    MessageActionRow,
    Modal,
} = require('discord.js');
const { InvalidInputError } = require('../../errors');

module.exports = {
    category:'Notifications',
    name: 'notify',
    description: 'Notify servers.',
    guildOnly: true,
    testOnly: true, //This just makes it available to my private server.
    slash: true,

    callback: async ({ interaction, client }) => errorHandler(interaction, async () => {
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
            if (!interact.isModalSubmit()) {
                return
            }

            const body = interact.fields.getTextInputValue('body');
            const title = interact.fields.getTextInputValue('title');

            if (body.length > 4096 || body.length <= 0) { // Max description size is 4096.
                throw new InvalidInputError('Body length must be less than 4015.')
            }

            if (title.length > 256 || title.length <= 0) { // Max title size is 256.
                throw new InvalidInputError('Title length must be less than or equal to 256.')
            }

            const guildDocs = await GuildSchema.find({ notifications: true })
            .select('notificationChannelId').lean()

            for (let guildDoc of guildDocs) {
                const guild = await client.guilds.cache.get(guildDoc._id)
                const notificationsChannel = await guild.channels.cache.get(guildDoc.notificationChannelId)
                
                //user set notification channel, guild system channel, or first channel in server
                await (
                    notificationsChannel ?? guild.systemChannel ?? (guild.channels
                    .filter(channel => channel.type === 'GUILD_TEXT')
                    .find(channel => channel.position === 0))
                ).send(notificationEmbed(title, body))
            }

            await interaction.reply(basicEmbed('Notification sent!'))
        })
    })
};