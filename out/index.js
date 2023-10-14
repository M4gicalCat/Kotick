import * as fs from 'fs';
import * as path from 'path';
import db from './db/config.js';
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import { onNotify } from './db/notifies/index.js';
import { createCommands } from './register-commands.js';
import { PERM } from './utils/permissions.js';
import { check_res } from './utils/check_res.js';
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});
client.once(Events.ClientReady, c => {
    var _a;
    console.log(`Logged in as ${(_a = c.user) === null || _a === void 0 ? void 0 : _a.tag}!`);
});
client.on(Events.GuildCreate, async (guild) => createCommands(guild.id));
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand())
        return;
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
        return console.error(`No command matching ${interaction.commandName} was found.`);
    }
    try {
        switch (command.perms) {
            case PERM.RESPONSABLE:
                await check_res(interaction);
                break;
        }
        await command.execute(interaction);
    }
    catch (error) {
        if (error.message === '403')
            return;
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: "Aïe, on dirait que je n'ai pas réussi à exécuter ta commande.",
                ephemeral: true,
            });
        }
        else {
            await interaction.reply({
                content: "Aïe, on dirait que je n'ai pas réussi à exécuter ta commande.",
                ephemeral: true,
            });
        }
    }
});
client.login(process.env.CLIENT_TOKEN);
client.commands = new Collection();
const foldersPath = path.join(process.env.PWD, 'out/commands');
const commandFolders = fs.readdirSync(foldersPath);
for (const folder of commandFolders) {
    // Grab all the command files from the commands directory you created earlier
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
        .readdirSync(commandsPath)
        .filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = (await import(filePath)).default;
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        }
        else {
            console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}
// connect to db & setup env
try {
    const { client: pgClient } = await db.connect();
    pgClient.on('notification', data => onNotify(data, client));
    pgClient.on('notice', console.warn);
    await pgClient.query('LISTEN reminders');
    console.log('Connected to the database!');
}
catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
}
