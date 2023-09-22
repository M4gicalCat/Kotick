import { google } from 'googleapis';
import client from './index.js';
import db from '../db/config.js';
const calendar = google.calendar({ version: 'v3', auth: client });
export function listEvents(calendarId, limit) {
    return calendar.events.list({
        calendarId,
        timeMin: new Date().toISOString(),
        maxResults: limit,
        singleEvents: true,
        orderBy: 'startTime',
    });
}
export const addCalendar = async (calendarId, guildId) => {
    if (!guildId || !calendarId)
        return;
    await db.task(async (t) => {
        if (await t.oneOrNone('SELECT 1 FROM discord.guild_calendar WHERE guild_id = $1 AND calendar_id = $2', [guildId, calendarId]))
            throw new Error('Ce calendrier est déjà enregistré');
        await calendar.calendarList
            .insert({
            requestBody: {
                id: calendarId,
            },
        })
            .catch(e => {
            console.error(e);
            throw new Error("Une erreur s'est produite en enregistrant le calendrier. Vérifiez qu'il soit partagé avec `bot.kotick@gmail.com`");
        });
        await t.none('INSERT INTO discord.guild_calendar (guild_id, calendar_id) VALUES ($1, $2)', [guildId, calendarId]);
    });
};
export const removeCalendar = async (calendarId, guildId) => {
    if (!guildId || !calendarId)
        return;
    await db.task(async (t) => {
        if (!(await t.oneOrNone('SELECT 1 FROM discord.guild_calendar WHERE guild_id = $1 AND calendar_id = $2', [guildId, calendarId])))
            throw new Error("ce calendrier n'est pas enregistré");
        const { count } = await t.one(`SELECT COUNT(*) FROM discord.guild_calendar WHERE calendar_id = $1`, [calendarId]);
        if (count === 1) {
            // If this is the last guild using this google, delete it from google
            await calendar.calendarList
                .delete({
                calendarId,
            })
                .catch(() => {
                throw new Error("Une erreur s'est produite en supprimant le calendrier.");
            });
        }
        await t.none('DELETE FROM discord.guild_calendar WHERE guild_id = $1 AND calendar_id = $2', [guildId, calendarId]);
    });
};
