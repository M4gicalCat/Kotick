import { google } from 'googleapis';
import * as fs from 'fs';
import { authenticate } from '@google-cloud/local-auth';
import * as path from 'path';
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
    }
    catch (e) { }
}
async function saveCredentials(client) {
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
let client = loadSavedCredentialsIfExist();
if (!client) {
    client = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
        await saveCredentials(client);
    }
}
export default client;
