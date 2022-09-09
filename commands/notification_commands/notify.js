const { basicEmbed, errorEmbed, notificationEmbed} = require('../../helpers/embeds');
const { Constants } = require('discord.js');
const GuildSchema = require('../../schemas/guild_schema');

module.exports = {
    description: 'Notify servers.',
    category:'Notifications',
    name: 'notify',
    //This just makes it available to my private server.
    testOnly: true,
    slash: true,

    options: [
        {
            name: 'title',
            description: 'The notification title.',
            type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'body',
            description: 'The notification text.',
            type: Constants.ApplicationCommandOptionTypes.STRING
        }
    ],

    callback: async ({ interaction, client }) => {
        try {
            const { options } = interaction;
            const body = (options.getString('body'))
            const title = (options.getString('title'))

            const guildDocs = await GuildSchema.find({ guildId: '817153676128813056', notifications: true })
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

            await interaction.reply(basicEmbed('Sent!'))
        } catch(err) {
            interaction.reply(errorEmbed(err))
            .catch(_ => interaction.channel.send(errorEmbed(err)))
        }
    }
};