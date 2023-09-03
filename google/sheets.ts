import { google } from 'googleapis';
import client from './index.js';
import db from '../db/config.js';

const drive = google.sheets({ version: 'v4', auth: client });

export const populateSheet = async (sheetId: string, guildId: string) => {
  // echo todo : grille de journée ?
  const data = [['Responsable', '', 'Activité', 'Responsables']];

  const responsables = await db.any(
    `
    SELECT
      un.name
      FROM discord.user_name un
    WHERE un.guild_id = $1
  `,
    [guildId],
  );

  for (const { name } of responsables) {
    data.push([name]);
  }

  await drive.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: 'A1',
    valueInputOption: 'RAW',
    requestBody: {
      values: data,
    },
  });
};
