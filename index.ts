import * as fs from 'fs';
import * as path from 'path';
import db from './db/config.js';
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import { authorize } from './calendar/index.js';

// connect to db & setup env
try {
  const { client } = await db.connect();
  client.on('notification', async data => {
    const payload = JSON.parse(data.payload);
    console.log('echo payload', payload);
  });
  client.on('notice', console.warn);
  await client.query('LISTEN meeting_reminders;LISTEN activity_reminders;');
  console.log('Connected to the database!');
} catch (error) {
  console.error('Unable to connect to the database:', error);
  process.exit(1);
}

type CustomClient = Client & { commands: Collection<string, any> };

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
}) as CustomClient;

client.once(Events.ClientReady, c => {
  console.log(`Logged in as ${c.user?.tag}!`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = (interaction.client as CustomClient).commands.get(
    interaction.commandName,
  );

  if (!command) {
    return console.error(
      `No command matching ${interaction.commandName} was found.`,
    );
  }
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    }
  }
});

client.login(process.env.CLIENT_TOKEN);

client.commands = new Collection();

const foldersPath = path.join(process.env.PWD!, 'out/commands');
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
    } else {
      console.warn(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
      );
    }
  }
}

authorize();
