import { SlashCommandBuilder } from '@discordjs/builders';
import { listEvents } from '../../google/calendar.js';
import { REST, } from 'discord.js';
import db from '../../db/config.js';
export default {
    data: new SlashCommandBuilder()
        .setDefaultMemberPermissions(0)
        .setName('load_events')
        .setDescription('Charge des événements depuis les calendriers enregistrés.')
        .addIntegerOption(option => option
        .setName('limit')
        .setDescription("Nombre d'événements à charger par calendrier (10 par défaut).")),
    async execute(interaction) {
        var _a;
        await interaction.deferReply({
            ephemeral: true,
        });
        const limit = (_a = interaction.options.getInteger('limit')) !== null && _a !== void 0 ? _a : 10;
        await db.task(async (t) => {
            var _a, _b;
            const calendars = await t.any(`
        SELECT calendar_id FROM discord.guild_calendar WHERE guild_id = $1`, [interaction.guildId]);
            if (!(calendars === null || calendars === void 0 ? void 0 : calendars.length)) {
                await interaction.editReply({
                    content: "Aucun calendrier n'est enregistré. Utilisez `/register_calendar` pour en ajouter un.",
                });
                return;
            }
            await interaction.editReply({
                content: `Chargement des événements discord`,
            });
            const rest = new REST().setToken(process.env.CLIENT_TOKEN);
            const guild_events = (await rest.get(`/guilds/${interaction.guildId}/scheduled-events`));
            await interaction.editReply({
                content: `Chargement des événements google`,
            });
            const promises = calendars.map(async ({ calendar_id }) => (Object.assign({ calendar_id }, (await listEvents(calendar_id, limit)))));
            let googleCalendars = await Promise.all(promises);
            googleCalendars = googleCalendars.filter(cal => { var _a, _b; return (_b = (_a = cal.data) === null || _a === void 0 ? void 0 : _a.items) === null || _b === void 0 ? void 0 : _b.length; });
            let total = 0;
            const errors = [];
            await interaction.editReply({
                content: `Mise à jour des événements discord`,
            });
            for (const cal of googleCalendars) {
                const events = cal.data.items;
                total += events.length;
                for (const event of events) {
                    await t.none(`
              INSERT INTO discord.event (calendar_id, event_id, title, start_time, end_time, guild_id)
              VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT ON CONSTRAINT event_pkey DO UPDATE
              SET title = $3, start_time = $4, end_time = $5
            `, [
                        cal.calendar_id,
                        event.id,
                        event.summary,
                        event.start.dateTime,
                        event.end.dateTime,
                        interaction.guildId,
                    ]);
                    const guild_event = guild_events.find(e => { var _a; return (_a = e.description) === null || _a === void 0 ? void 0 : _a.includes(`kotick@${event.id}`); });
                    try {
                        if (guild_event) {
                            await rest.patch(`/guilds/${interaction.guildId}/scheduled-events/${guild_event.id}`, {
                                body: {
                                    name: event.summary,
                                    time: event.start.dateTime,
                                    duration: event.end.dateTime,
                                    entity_metadata: {
                                        location: (_a = event.location) !== null && _a !== void 0 ? _a : 'Localisation inconnue',
                                    },
                                },
                            });
                        }
                        else {
                            await rest.post(`/guilds/${interaction.guildId}/scheduled-events`, {
                                body: {
                                    name: event.summary,
                                    privacy_level: 2,
                                    entity_type: 3,
                                    scheduled_start_time: event.start.dateTime,
                                    scheduled_end_time: event.end.dateTime,
                                    description: `kotick@${event.id}`,
                                    entity_metadata: {
                                        location: (_b = event.location) !== null && _b !== void 0 ? _b : 'Localisation inconnue',
                                    },
                                },
                            });
                        }
                    }
                    catch (e) {
                        console.error(e);
                        errors.push(event.summary);
                    }
                }
            }
            await interaction.editReply({
                content: `${total} événement(s) ont été chargés depuis ${calendars.length} calendrier${calendars.length > 1 ? 's' : ''}
        ${errors.length
                    ? `\nCes événements n'ont pas pu être mis à jour :\n${errors.map(e => `- ${e}\n`)}`
                    : ''}
        `,
            });
        });
    },
};
