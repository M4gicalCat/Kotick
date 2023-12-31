import db from '../config.js';
import { Client, EmbedBuilder, TextChannel } from 'discord.js';

interface IReminders {
  meeting?: { event: string; guild: string }[];
  presence?: { event: string; guild: string }[];
  event?: { event: string; guild: string }[];
  activity?: { event_id: string; activity_name: string; guild_id: string }[];
  activity_meeting?: {
    event_id: string;
    activity_name: string;
    guild_id: string;
  }[];
  meeting_today?: { event: string; guild: string }[];
}

const getcolor = (percentage: number) => {
  if (percentage > 0.75) return '#00FF00';
  if (percentage > 0.5) return '#FFA500';
  if (percentage > 0.25) return '#FF0000';
  return '#000000';
};
export const onReminders = async (data: IReminders, client: Client) =>
  db.task(async t => {
    if (data.meeting?.length) {
      for (const meeting of data.meeting) {
        const reminder = await t.one<{
          channel: string;
          role: string;
          title: string;
          percentage: number;
        }>(
          `
          SELECT
          gs.meeting_reminders_channel as channel,
          gs.role_responsable as role,
          (e.start_time::date - CURRENT_DATE)::float / gs.meeting_reminder as percentage,
          e.title
        FROM discord.event e
        JOIN discord.guild_settings gs ON gs.guild_id = e.guild_id
        WHERE e.event_id = $1 AND e.guild_id = $2
        `,
          [meeting.event, meeting.guild],
        );
        const channel = client.channels.cache.get(reminder.channel);
        if (!channel) continue;
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
            iconURL:
              'https://cdn.discordapp.com/app-icons/1146507687291531349/d9aa1f23d1ce85e9fa36a58a5021f61f.png?size=4096',
          });
        (channel as TextChannel)
          .send({
            content: `<@&${reminder.role}>`,
            embeds: [message],
          })
          .then(() => {});
      }
    }
    if (data.activity?.length) {
      for (const acti of data.activity) {
        const { channel, title, percentage, names } = await t.one<{
          channel: string;
          title: string;
          percentage: number;
          names: string[];
        }>(
          `
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
        `,
          [acti.event_id, acti.guild_id, acti.activity_name],
        );
        const channel_obj = client.channels.cache.get(channel);
        if (!channel_obj) continue;
        const message = new EmbedBuilder()
          .setTitle(`Rappel de création d'activité`)
          .setDescription(
            `Pensez à créer l'activité **${acti.activity_name}** pour **${title}**`,
          )
          .setColor(getcolor(percentage))
          .addFields({
            name: 'Étape suivante',
            value: `Après avoir créé l'activité, utilisez \`/activite\` pour la marquer comme terminée.`,
          })
          .setFooter({
            text: 'Rappel automatique de Kotick',
            iconURL:
              'https://cdn.discordapp.com/app-icons/1146507687291531349/d9aa1f23d1ce85e9fa36a58a5021f61f.png?size=4096',
          });
        (channel_obj as TextChannel)
          .send({
            content: names.map(n => `<@${n}>`).join(', '),
            embeds: [message],
          })
          .then(() => {});
      }
    }
    if (data.activity_meeting?.length) {
      for (const acti of data.activity_meeting) {
        const { channel, title, names } = await t.one<{
          channel: string;
          title: string;
          names: string[];
        }>(
          `
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
        `,
          [acti.event_id, acti.guild_id, acti.activity_name],
        );
        const channel_obj = client.channels.cache.get(channel);
        if (!channel_obj) continue;
        const message = new EmbedBuilder()
          .setTitle(`Rappel de réunion d'activité`)
          .setDescription(
            `Ajourd'hui, vous préparez **${acti.activity_name}** pour **${title}**`,
          )
          .addFields({
            name: 'Étape suivante',
            value: `Une fois que vous avez créé l'activité, utilisez \`/activite\` pour la marquer comme terminée.`,
          })
          .setFooter({
            text: 'Rappel automatique de Kotick',
            iconURL:
              'https://cdn.discordapp.com/app-icons/1146507687291531349/d9aa1f23d1ce85e9fa36a58a5021f61f.png?size=4096',
          });
        (channel_obj as TextChannel)
          .send({
            content: names.map(n => `<@${n}>`).join(', '),
            embeds: [message],
          })
          .then(() => {});
      }
    }
    if (data.presence?.length) {
      for (const presence of data.presence) {
        const reminder = await t.one<{
          channel: string;
          role: string;
          title: string;
          start: number;
          end: number;
        }>(
          `
        SELECT
          gs.activity_reminders_channel as channel,
          gs.role_enfant as role,
          EXTRACT(EPOCH FROM e.start_time) as start,
          EXTRACT(EPOCH FROM e.end_time) as "end",
          e.title
        FROM discord.event e
        JOIN discord.guild_settings gs ON gs.guild_id = e.guild_id
        WHERE e.event_id = $1 AND e.guild_id = $2
        `,
          [presence.event, presence.guild],
        );
        const channel = client.channels.cache.get(reminder.channel);
        if (!channel) continue;
        const embed = new EmbedBuilder()
          .setTitle(`Une activité approche !`)
          .setDescription(
            `**${reminder.title}** aura lieu du <t:${Math.floor(
              reminder.start,
            )}> au <t:${Math.floor(reminder.end)}>`,
          )
          .addFields({
            name: 'Serez vous présent ?',
            value: `Réagissez à ce message si vous pensez venir ou pas !`,
          })
          .setFooter({
            text: 'Rappel automatique de Kotick',
            iconURL:
              'https://cdn.discordapp.com/app-icons/1146507687291531349/d9aa1f23d1ce85e9fa36a58a5021f61f.png?size=4096',
          });
        (async () => {
          const message = await (channel as TextChannel).send({
            content: `<@&${reminder.role}>`,
            embeds: [embed],
          });
          await message.react('✅');
          await message.react('❌');
        })().then(() => {});
      }
    }
    if (data.event?.length) {
      for (const event of data.event) {
        const reminder = await t.one<{
          channel: string;
          role: string;
          title: string;
          start: number;
          end: number;
        }>(
          `
        SELECT
          gs.activity_reminders_channel as channel,
          gs.role_enfant as role,
          EXTRACT(EPOCH FROM e.start_time) as start,
          EXTRACT(EPOCH FROM e.end_time) as "end",
          e.title
        FROM discord.event e
        JOIN discord.guild_settings gs ON gs.guild_id = e.guild_id
        WHERE e.event_id = $1 AND e.guild_id = $2
        `,
          [event.event, event.guild],
        );
        const channel = client.channels.cache.get(reminder.channel);
        if (!channel) continue;
        const embed = new EmbedBuilder()
          .setTitle(`Rappel d'activité !`)
          .setDescription(`**${reminder.title}** a lieu aujourd'hui !!!!`)
          .addFields(
            {
              name: "Début de l'activité",
              value: ` <t:${Math.floor(reminder.start)}>`,
              inline: true,
            },
            {
              name: "Fin de l'activité",
              value: ` <t:${Math.floor(reminder.end)}>`,
              inline: true,
            },
          )
          .setFooter({
            text: 'Rappel automatique de Kotick',
            iconURL:
              'https://cdn.discordapp.com/app-icons/1146507687291531349/d9aa1f23d1ce85e9fa36a58a5021f61f.png?size=4096',
          });
        (async () => {
          const message = await (channel as TextChannel).send({
            content: `<@&${reminder.role}>`,
            embeds: [embed],
          });
        })().then(() => {});
      }
    }
    if (data.meeting_today?.length) {
      for (const event of data.meeting_today) {
        const reminder = await t.one<{
          channel: string;
          role: string;
          title: string;
          start: number;
          end: number;
        }>(
          `
        SELECT
          gs.meeting_reminders_channel as channel,
          gs.role_responsable as role,
          extract(epoch from e.meeting_time) as start,
          e.title
        FROM discord.event e
        JOIN discord.guild_settings gs ON gs.guild_id = e.guild_id
        WHERE e.event_id = $1 AND e.guild_id = $2
        `,
          [event.event, event.guild],
        );
        const channel = client.channels.cache.get(reminder.channel);
        if (!channel) continue;
        const embed = new EmbedBuilder()
          .setTitle(`Rappel de réunion !`)
          .setDescription(
            `La réunion de préparation de **${
              reminder.title
            }** aura lieu à <t:${Math.floor(reminder.start)}>`,
          )
          .setFooter({
            text: 'Rappel automatique de Kotick',
            iconURL:
              'https://cdn.discordapp.com/app-icons/1146507687291531349/d9aa1f23d1ce85e9fa36a58a5021f61f.png?size=4096',
          });
        (async () => {
          const message = await (channel as TextChannel).send({
            content: `<@&${reminder.role}>`,
            embeds: [embed],
          });
        })().then(() => {});
      }
    }
  });
