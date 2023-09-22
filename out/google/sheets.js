import { google } from 'googleapis';
import client from './index.js';
import db from '../db/config.js';
const drive = google.sheets({ version: 'v4', auth: client });
export const populateSheet = async (sheetId, guildId, update) => {
    const data = [
        ['Responsables', '', "Nom de l'activité", "Responsable sur l'activité"],
    ];
    await update('Création des données de la feuille...');
    const responsables = await db.any(`
        SELECT un.name
        FROM discord.user_name un
        WHERE un.guild_id = $1
    `, [guildId]);
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
    await drive.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
            requests: [
                {
                    setDataValidation: {
                        rule: {
                            condition: {
                                type: 'ONE_OF_RANGE',
                                values: [
                                    {
                                        userEnteredValue: '=A2:A',
                                    },
                                ],
                            },
                            strict: true,
                            showCustomUi: false,
                        },
                        range: {
                            sheetId: 0,
                            startRowIndex: 1,
                            startColumnIndex: 3,
                            endColumnIndex: 6,
                        },
                    },
                },
            ],
        },
    });
};
export const getActivitiesFromSheet = async (sheetId) => {
    const res = (await drive.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'C2:G',
    })).data;
    const actis = [];
    for (const row of res.values) {
        const [name, ...responsables] = row;
        actis.push({
            name,
            responsables: [...new Set(responsables)],
        });
    }
    return actis;
};
