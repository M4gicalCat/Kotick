import { google } from 'googleapis';
import client from './index.js';
import db from '../db/config.js';

const drive = google.sheets({ version: 'v4', auth: client });

export const populateSheet = async (
  sheetId: string,
  guildId: string,
  update: (msg: string) => Promise<any>,
) => {
  // echo todo : grille de journée ?
  const data = [
    ['Responsables', '', "Nom de l'activité", "Responsable sur l'activité"],
  ];
  update('Création des données de la sheet...');
  const responsables = await db.any(
    `
        SELECT un.name
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
              showCustomUi: true,
            },
            range: {
              sheetId: 0,
              startRowIndex: 1,
              startColumnIndex: 3,
            },
          },
        },
      ],
    },
  });
};
