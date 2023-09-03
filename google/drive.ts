import { google } from 'googleapis';
import client from './index.js';
import db from '../db/config.js';
import { populateSheet } from './sheets';

const drive = google.drive({ version: 'v3', auth: client });

export const createSheet = async (
  folderId: string,
  guildId: string,
  eventId: string,
  sheetName: string,
) => {
  const res = await drive.files.create({
    requestBody: {
      name: sheetName,
      mimeType: 'application/vnd.google-apps.spreadsheet',
      parents: [folderId],
    },
  });

  await db.none(
    `INSERT INTO discord.event_sheet (event_id, sheet_id, guild_id) VALUES ($1, $2, $3)`,
    [eventId, res.data.id, guildId],
  );

  await populateSheet(res.data.id!, guildId);

  await drive.permissions.create({
    fileId: res.data.id!,
    requestBody: {
      role: 'writer',
      type: 'anyone',
    },
  });

  return res.data.id;
};
