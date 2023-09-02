import { calendar_v3, google } from 'googleapis';
import * as fs from 'fs';
import { authenticate } from '@google-cloud/local-auth';
import * as path from 'path';
import db from '../db/config.js';
let calendar: calendar_v3.Calendar;

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive',
];
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

function loadSavedCredentialsIfExist() {
  try {
    const credentials = JSON.parse(fs.readFileSync('./token.json').toString());
    return google.auth.fromJSON(credentials);
  } catch (e) {}
}

async function saveCredentials(client: any) {
  const keys = JSON.parse(fs.readFileSync(CREDENTIALS_PATH).toString());
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  fs.writeFileSync('./token.json', payload);
}
export async function authorize() {
  let client: any = await loadSavedCredentialsIfExist();
  if (client) {
    calendar = google.calendar({ version: 'v3', auth: client });
    return;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  calendar = google.calendar({ version: 'v3', auth: client });
}

export function listEvents(calendarId: string, limit: number) {
  return calendar.events.list({
    calendarId,
    timeMin: new Date().toISOString(),
    maxResults: limit,
    singleEvents: true,
    orderBy: 'startTime',
  });
}

export const addCalendar = async (calendarId: string, guildId: string) => {
  if (!guildId || !calendarId) return;
  await db.task(async t => {
    if (
      await t.oneOrNone(
        'SELECT 1 FROM discord.guild_calendar WHERE guild_id = $1 AND calendar_id = $2',
        [guildId, calendarId],
      )
    )
      throw new Error('Ce calendrier est déjà enregistré');
    await calendar.calendarList
      .insert({
        requestBody: {
          id: calendarId,
        },
      })
      .catch(() => {
        throw new Error(
          "Une erreur s'est produite en enregistrant le calendrier. Vérifiez qu'il soit partagé avec `bot.kotick@gmail.com`",
        );
      });
    await t.none(
      'INSERT INTO discord.guild_calendar (guild_id, calendar_id) VALUES ($1, $2)',
      [guildId, calendarId],
    );
  });
};

export const removeCalendar = async (calendarId: string, guildId: string) => {
  if (!guildId || !calendarId) return;
  await db.task(async t => {
    if (
      !(await t.oneOrNone(
        'SELECT 1 FROM discord.guild_calendar WHERE guild_id = $1 AND calendar_id = $2',
        [guildId, calendarId],
      ))
    )
      throw new Error("ce calendrier n'est pas enregistré");

    const { count } = await t.one(
      `SELECT COUNT(*) FROM discord.guild_calendar WHERE calendar_id = $1`,
      [calendarId],
    );
    if (count === 1) {
      // If this is the last guild using this calendar, delete it from google
      await calendar.calendarList
        .delete({
          calendarId,
        })
        .catch(() => {
          throw new Error(
            "Une erreur s'est produite en supprimant le calendrier.",
          );
        });
    }
    await t.none(
      'DELETE FROM discord.guild_calendar WHERE guild_id = $1 AND calendar_id = $2',
      [guildId, calendarId],
    );
  });
};
