import db from '../config.js';
import { EmbedBuilder } from 'discord.js';
const getcolor = (percentage) => {
    if (percentage > 0.75)
        return '#00FF00';
    if (percentage > 0.5)
        return '#FFA500';
    if (percentage > 0.25)
        return '#FF0000';
    return '#000000';
};
export const onReminders = async (data, client) => db.task(async (t) => {
    var _a, _b, _c, _d, _e, _f;
    if ((_a = data.meeting) === null || _a === void 0 ? void 0 : _a.length) {
        for (const meeting of data.meeting) {
            const reminder = await t.one(`
          SELECT
          gs.meeting_reminders_channel as channel,
          gs.role_responsable as role,
          (e.start_time::date - CURRENT_DATE)::float / gs.meeting_reminder as percentage,
          e.title
        FROM discord.event e
        JOIN discord.guild_settings gs ON gs.guild_id = e.guild_id
        WHERE e.event_id = $1 AND e.guild_id = $2
        `, [meeting.event, meeting.guild]);
            const channel = client.channels.cache.get(reminder.channel);
            if (!channel)
                continue;
            const message = new EmbedBuilder()
                .setTitle(`Rappel de réunion`)
                .setDescription(`Pensez à préparer l'activité **${reminder.title}**`)
                .setColor(getcolor(reminder.percentage))
                .addFields({
                name: 'Étape suivante',
                value: `Une fois que vous avez défini une date de réunion, utilisez \`/reunion\` pour la définir.`,
            })
                .setFooter({
                text: 'Rappel automatique de Kotick',
                iconURL: 'https://cdn.discordapp.com/app-icons/1146507687291531349/d9aa1f23d1ce85e9fa36a58a5021f61f.png?size=4096',
            });
            channel
                .send({
                content: `<@&${reminder.role}>`,
                embeds: [message],
            })
                .then(() => { });
        }
    }
    if ((_b = data.activity) === null || _b === void 0 ? void 0 : _b.length) {
        for (const acti of data.activity) {
            const { channel, title, percentage, names } = await t.one(`
        SELECT
          gs.meeting_reminders_channel as channel,
          (e.start_time::date - CURRENT_DATE)::float / gs.meeting_reminder as percentage,
          array_agg(eu.user_id) as names,
          e.title
        FROM discord.event e
        JOIN discord.guild_settings gs ON gs.guild_id = e.guild_id
        JOIN discord.event_activity ea on e.event_id = ea.event_id and e.guild_id = ea.guild_id
        LEFT JOIN discord.event_user eu on ea.event_id = eu.event_id and ea.activity_name = eu.activity_name and ea.guild_id = eu.guild_id
        WHERE e.event_id = $1 and e.guild_id = $2 AND ea.activity_name = $3
        GROUP BY e.event_id, e.start_time, e.end_time, gs.meeting_reminders_channel, gs.role_responsable, gs.meeting_reminder, e.title
        `, [acti.event_id, acti.guild_id, acti.activity_name]);
            const channel_obj = client.channels.cache.get(channel);
            if (!channel_obj)
                continue;
            const message = new EmbedBuilder()
                .setTitle(`Rappel de création d'activité`)
                .setDescription(`Pensez à créer l'activité **${acti.activity_name}** pour **${title}**`)
                .setColor(getcolor(percentage))
                .addFields({
                name: 'Étape suivante',
                value: `Après avoir créé l'activité, utilisez \`/activite\` pour la marquer comme terminée.`,
            })
                .setFooter({
                text: 'Rappel automatique de Kotick',
                iconURL: 'https://cdn.discordapp.com/app-icons/1146507687291531349/d9aa1f23d1ce85e9fa36a58a5021f61f.png?size=4096',
            });
            channel_obj
                .send({
                content: names.map(n => `<@${n}>`).join(', '),
                embeds: [message],
            })
                .then(() => { });
        }
    }
    if ((_c = data.activity_meeting) === null || _c === void 0 ? void 0 : _c.length) {
        for (const acti of data.activity_meeting) {
            const { channel, title, names } = await t.one(`
        SELECT
          gs.meeting_reminders_channel as channel,
          array_agg(eu.user_id) as names,
          ea.meeting_time as time,
          e.title
        FROM discord.event e
        JOIN discord.guild_settings gs ON gs.guild_id = e.guild_id
        JOIN discord.event_activity ea on e.event_id = ea.event_id and e.guild_id = ea.guild_id
        LEFT JOIN discord.event_user eu on ea.event_id = eu.event_id and ea.activity_name = eu.activity_name and ea.guild_id = eu.guild_id
        WHERE e.event_id = $1 and e.guild_id = $2 AND ea.activity_name = $3
        GROUP BY e.event_id, e.start_time, e.end_time, gs.meeting_reminders_channel, gs.role_responsable, gs.meeting_reminder, e.title
        `, [acti.event_id, acti.guild_id, acti.activity_name]);
            const channel_obj = client.channels.cache.get(channel);
            if (!channel_obj)
                continue;
            const message = new EmbedBuilder()
                .setTitle(`Rappel de réunion d'activité`)
                .setDescription(`Ajourd'hui, vous préparez **${acti.activity_name}** pour **${title}**`)
                .addFields({
                name: 'Étape suivante',
                value: `Une fois que vous avez créé l'activité, utilisez \`/activite\` pour la marquer comme terminée.`,
            })
                .setFooter({
                text: 'Rappel automatique de Kotick',
                iconURL: 'https://cdn.discordapp.com/app-icons/1146507687291531349/d9aa1f23d1ce85e9fa36a58a5021f61f.png?size=4096',
            });
            channel_obj
                .send({
                content: names.map(n => `<@${n}>`).join(', '),
                embeds: [message],
            })
                .then(() => { });
        }
    }
    if ((_d = data.presence) === null || _d === void 0 ? void 0 : _d.length) {
        for (const presence of data.presence) {
            const reminder = await t.one(`
        SELECT
          gs.activity_reminders_channel as channel,
          gs.role_enfant as role,
          EXTRACT(EPOCH FROM e.start_time) as start,
          EXTRACT(EPOCH FROM e.end_time) as "end",
          e.title
        FROM discord.event e
        JOIN discord.guild_settings gs ON gs.guild_id = e.guild_id
        WHERE e.event_id = $1 AND e.guild_id = $2
        `, [presence.event, presence.guild]);
            const channel = client.channels.cache.get(reminder.channel);
            if (!channel)
                continue;
            const embed = new EmbedBuilder()
                .setTitle(`Une activité approche !`)
                .setDescription(`**${reminder.title}** aura lieu du <t:${Math.floor(reminder.start)}> au <t:${Math.floor(reminder.end)}>`)
                .addFields({
                name: 'Serez vous présent ?',
                value: `Réagissez à ce message si vous pensez venir ou pas !`,
            })
                .setFooter({
                text: 'Rappel automatique de Kotick',
                iconURL: 'https://cdn.discordapp.com/app-icons/1146507687291531349/d9aa1f23d1ce85e9fa36a58a5021f61f.png?size=4096',
            });
            (async () => {
                const message = await channel.send({
                    content: `<@&${reminder.role}>`,
                    embeds: [embed],
                });
                await message.react('✅');
                await message.react('❌');
            })().then(() => { });
        }
    }
    if ((_e = data.event) === null || _e === void 0 ? void 0 : _e.length) {
        for (const event of data.event) {
            const reminder = await t.one(`
        SELECT
          gs.activity_reminders_channel as channel,
          gs.role_enfant as role,
          EXTRACT(EPOCH FROM e.start_time) as start,
          EXTRACT(EPOCH FROM e.end_time) as "end",
          e.title
        FROM discord.event e
        JOIN discord.guild_settings gs ON gs.guild_id = e.guild_id
        WHERE e.event_id = $1 AND e.guild_id = $2
        `, [event.event, event.guild]);
            const channel = client.channels.cache.get(reminder.channel);
            if (!channel)
                continue;
            const embed = new EmbedBuilder()
                .setTitle(`Rappel d'activité !`)
                .setDescription(`**${reminder.title}** a lieu aujourd'hui !!!!`)
                .addFields({
                name: "Début de l'activité",
                value: ` <t:${Math.floor(reminder.start)}>`,
                inline: true,
            }, {
                name: "Fin de l'activité",
                value: ` <t:${Math.floor(reminder.end)}>`,
                inline: true,
            })
                .setFooter({
                text: 'Rappel automatique de Kotick',
                iconURL: 'https://cdn.discordapp.com/app-icons/1146507687291531349/d9aa1f23d1ce85e9fa36a58a5021f61f.png?size=4096',
            });
            (async () => {
                const message = await channel.send({
                    content: `<@&${reminder.role}>`,
                    embeds: [embed],
                });
            })().then(() => { });
        }
    }
    if ((_f = data.meeting_today) === null || _f === void 0 ? void 0 : _f.length) {
        for (const event of data.meeting_today) {
            const reminder = await t.one(`
        SELECT
          gs.meeting_reminders_channel as channel,
          gs.role_responsable as role,
          extract(epoch from e.meeting_time) as start,
          e.title
        FROM discord.event e
        JOIN discord.guild_settings gs ON gs.guild_id = e.guild_id
        WHERE e.event_id = $1 AND e.guild_id = $2
        `, [event.event, event.guild]);
            const channel = client.channels.cache.get(reminder.channel);
            if (!channel)
                continue;
            const embed = new EmbedBuilder()
                .setTitle(`Rappel de réunion !`)
                .setDescription(`La réunion de préparation de **${reminder.title}** aura lieu à <t:${Math.floor(reminder.start)}>`)
                .setFooter({
                text: 'Rappel automatique de Kotick',
                iconURL: 'https://cdn.discordapp.com/app-icons/1146507687291531349/d9aa1f23d1ce85e9fa36a58a5021f61f.png?size=4096',
            });
            (async () => {
                const message = await channel.send({
                    content: `<@&${reminder.role}>`,
                    embeds: [embed],
                });
            })().then(() => { });
        }
    }
});
