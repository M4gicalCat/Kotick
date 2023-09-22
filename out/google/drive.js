import { google } from 'googleapis';
import client from './index.js';
import db from '../db/config.js';
import { populateSheet } from './sheets.js';
const drive = google.drive({ version: 'v3', auth: client });
export const createSheet = async (folderId, guildId, eventId, sheetName, update) => {
    const res = await drive.files.create({
        requestBody: {
            name: sheetName,
            mimeType: 'application/vnd.google-apps.spreadsheet',
            parents: [folderId],
        },
    });
    await db.none(`UPDATE discord.event SET sheet_id = $2 WHERE event_id = $1 AND guild_id = $3`, [eventId, res.data.id, guildId]);
    await populateSheet(res.data.id, guildId, update);
    await update('Partage de la feuille...');
    await drive.permissions.create({
        fileId: res.data.id,
        requestBody: {
            role: 'writer',
            type: 'anyone',
        },
    });
    return res.data.id;
};
